/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Route, Switch } from "wouter";
import HomePage from "./components/HomePage.tsx";
import HangoutPage from "./components/HangoutPage.tsx";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center">
      <header className="w-full max-w-2xl py-6 px-6 lg:px-8 mt-4 md:mt-12 flex items-center justify-between">
        <h1 className="font-mono font-medium tracking-tight text-xl">GatherMin.</h1>
      </header>
      
      <main className="w-full max-w-2xl px-6 lg:px-8 pb-24">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/create" component={HomePage} />
          <Route path="/hangout/:id" component={HangoutPage} />
          <Route>
            <div className="py-24 text-center text-zinc-500 font-mono text-sm">
              404 - Area not found.
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}