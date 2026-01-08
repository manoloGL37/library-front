import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly TOKEN_KEY = 'auth_token';
  // Usa el prefijo correcto según tu backend: si expone /api/ai, cámbialo a `${environment.apiUrl}/api/ai`
  private apiUrl = `${environment.apiUrl}/ai`;
  private lastConversationId: string | null = null;

  constructor(private zone: NgZone) {}

  private getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Parser SSE robusto: agrupa múltiples data: por evento y maneja event: done y event: meta
  private readSSEStream(
    response: Response,
    onData: (text: string) => void,
    onDone?: () => void,
    onMeta?: (value: string) => void,
    controller?: AbortController
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      return Promise.reject(new Error('Stream no disponible en la respuesta SSE.'));
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let receivedAnyChunk = false;

    const processEventBlock = (eventBlock: string): boolean => {
      const lines = eventBlock.replace(/\r/g, '').split('\n');

      let isDoneEvent = false;
      let isMetaEvent = false;
      const dataParts: string[] = [];

      for (const rawLine of lines) {
        // NO trim aquí: si haces trim, pierdes espacios tokenizados
        const line = rawLine;
        if (!line) continue;

        if (line.startsWith('event:')) {
          const ev = line.slice(6).trim(); // aquí sí es seguro trim
          if (ev === 'done') isDoneEvent = true;
          if (ev === 'meta') isMetaEvent = true;
          continue;
        }

        if (line.startsWith('data:')) {
          // Preserva espacios del payload; quita solo 1 espacio opcional tras "data:"
          let data = line.slice(5);
          if (data.startsWith(' ')) data = data.slice(1);
          dataParts.push(data);
          continue;
        }
      }

      if (isDoneEvent) {
        onDone?.();
        return true;
      }

      if (isMetaEvent && dataParts.length > 0) {
        onMeta?.(dataParts.join(''));
        return false;
      }

      if (dataParts.length > 0) {
        const payload = dataParts.join('\n');
        const trimmedPayload = payload.trim();
        if (trimmedPayload === '[DONE]') {
          onDone?.();
          return true;
        }
        receivedAnyChunk = true;
        onData(payload);
        return false;
      }

      // Fallback: algunos backends envían texto plano sin prefijos "data:"
      if (eventBlock.trim().length > 0) {
        const trimmedBlock = eventBlock.trim();
        if (trimmedBlock === '[DONE]') {
          onDone?.();
          return true;
        }
        receivedAnyChunk = true;
        onData(eventBlock);
      }

      return false;
    };

    const processBuffer = (flush = false): boolean => {
      let sepIndex: number;

      while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
        const eventBlock = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);

        const finished = processEventBlock(eventBlock);
        if (finished) return true;
      }

      if (flush && buffer.length > 0) {
        const tail = buffer;
        buffer = '';
        const finished = processEventBlock(tail);
        if (finished) return true;
      }

      return false;
    };

    const loop = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        if (processBuffer(false)) return;
      }
    };

    return loop()
      .then(() => {
        buffer += decoder.decode(); // flush decoder
        const finished = processBuffer(true);
        if (!finished) onDone?.();
      })
      .catch((error) => {
        if (controller?.signal.aborted) {
          buffer += decoder.decode();
          processBuffer(true);
          onDone?.();
          return;
        }

        const message = String(error?.message || '').toLowerCase();
        const isAbortError = error?.name === 'AbortError';
        const isNetworkError =
          message.includes('network error') || message.includes('incomplete_chunked_encoding');

        if ((isAbortError || isNetworkError) && receivedAnyChunk) {
          buffer += decoder.decode();
          processBuffer(true);
          onDone?.();
          return;
        }

        throw error;
      })
      .finally(() => {
        reader.releaseLock();
      });
  }

  startConversation(): Observable<{ conversationId: string; message: string }> {
    return new Observable((observer) => {
      const token = this.getAuthToken();
      const headers: HeadersInit = { Accept: 'text/event-stream' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = `${this.apiUrl}/chat/start`;
      console.log('[ChatService] startConversation → URL:', url);
      console.log('[ChatService] startConversation → hasAuth:', Boolean(token));
      if (token) {
        console.log(
          '[ChatService] startConversation → Authorization (masked):',
          `Bearer ${token.slice(0, 10)}...`
        );
      }

      const controller = new AbortController();
      let aggregated = '';

      fetch(url, {
        method: 'GET',
        headers,
        credentials: 'omit', // JWT: sin cookies
        signal: controller.signal,
      })
        .then((response) => {
          console.log(
            '[ChatService] startConversation → status:',
            response.status,
            response.statusText
          );

          const respHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => (respHeaders[key] = value));
          console.log('[ChatService] startConversation → response headers:', respHeaders);

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          let conversationId =
            response.headers.get('X-Conversation-Id') ||
            response.headers.get('x-conversation-id') ||
            '';
          if (conversationId) {
            console.log(
              '[ChatService] startConversation → X-Conversation-Id (header):',
              conversationId
            );
            this.lastConversationId = conversationId;
          } else {
            console.warn(
              '[ChatService] startConversation → no se encontró X-Conversation-Id en los headers.'
            );
          }

          return this.readSSEStream(
            response,
            (textChunk) => {
              aggregated += textChunk;
              if (conversationId) this.lastConversationId = conversationId;
              this.zone.run(() => {
                observer.next({ conversationId, message: aggregated });
              });
            },
            () => {
              console.log('[ChatService] startConversation → stream done');
              this.zone.run(() => observer.complete());
            },
            (metaValue) => {
              if (metaValue) {
                const parsed = metaValue.trim();
                try {
                  const asJson = JSON.parse(parsed);
                  if (asJson?.conversationId) conversationId = String(asJson.conversationId);
                } catch {
                  conversationId = parsed;
                }
                if (conversationId) {
                  console.log(
                    '[ChatService] startConversation → X-Conversation-Id (meta):',
                    conversationId
                  );
                  this.lastConversationId = conversationId;
                  this.zone.run(() => {
                    observer.next({ conversationId, message: aggregated });
                  });
                }
              }
            },
            controller
          );
        })
        .catch((err) => {
          console.error('[ChatService] startConversation → error:', err);
          if (controller.signal.aborted) {
            this.zone.run(() => observer.complete());
            return;
          }

          const message = String(err?.message || '').toLowerCase();
          const isNetworkError =
            message.includes('network error') || message.includes('incomplete_chunked_encoding');

          if (isNetworkError && aggregated.length > 0) {
            this.zone.run(() => observer.complete());
            return;
          }

          this.zone.run(() => observer.error(err));
        });

      return () => {
        controller.abort();
      };
    });
  }

  sendMessage(conversationId: string, message: string): Observable<string> {
    return new Observable((observer) => {
      const effectiveConversationId = conversationId || this.lastConversationId || '';
      if (!effectiveConversationId) {
        observer.error(
          new Error(
            'No hay conversationId activo. Inicia la conversación antes de enviar mensajes.'
          )
        );
        return;
      }

      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = `${this.apiUrl}/chat`;
      console.log('[ChatService] sendMessage → URL:', url);
      console.log('[ChatService] sendMessage → hasAuth:', Boolean(token));
      if (token) {
        console.log(
          '[ChatService] sendMessage → Authorization (masked):',
          `Bearer ${token.slice(0, 10)}...`
        );
      }
      if (!conversationId) {
        console.warn(
          '[ChatService] sendMessage → conversationId vacío en el componente, usando el último del servicio.'
        );
      }
      console.log('[ChatService] sendMessage → conversationId:', effectiveConversationId);

      const controller = new AbortController();
      let aggregated = '';

      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId: effectiveConversationId, message }),
        credentials: 'omit',
        signal: controller.signal,
      })
        .then((response) => {
          console.log('[ChatService] sendMessage → status:', response.status, response.statusText);

          const respHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => (respHeaders[key] = value));
          console.log('[ChatService] sendMessage → response headers:', respHeaders);

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          return this.readSSEStream(
            response,
            (textChunk) => {
              aggregated += textChunk;
              this.zone.run(() => observer.next(aggregated));
            },
            () => {
              console.log('[ChatService] sendMessage → stream done');
              this.zone.run(() => observer.complete());
            },
            undefined,
            controller
          );
        })
        .catch((err) => {
          console.error('[ChatService] sendMessage → error:', err);
          if (controller.signal.aborted) {
            this.zone.run(() => observer.complete());
            return;
          }

          const messageText = String(err?.message || '').toLowerCase();
          const isNetworkError =
            messageText.includes('network error') ||
            messageText.includes('incomplete_chunked_encoding');

          if (isNetworkError && aggregated.length > 0) {
            this.zone.run(() => observer.complete());
            return;
          }

          this.zone.run(() => observer.error(err));
        });

      return () => {
        controller.abort();
      };
    });
  }
}
