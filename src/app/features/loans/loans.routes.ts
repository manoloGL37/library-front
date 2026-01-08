import { Routes } from "@angular/router";
import { LoanListView } from "./pages/loan-list/loan-list";


export const LOANS_ROUTES: Routes = [
  {
    path: '',
    component: LoanListView,
  },
];