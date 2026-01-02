import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "../../shared/components/header/header";
import { Alert } from "../../shared/components/alert/alert";

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Header, Alert],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {

}
