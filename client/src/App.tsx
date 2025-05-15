import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useState } from "react";
import { EventDetailModal } from "./components/EventDetailModal";
import { Event } from "./lib/types";

function Router() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Switch>
        <Route 
          path="/" 
          component={() => (
            <Home 
              onEventSelect={(event) => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
            />
          )} 
        />
        <Route component={NotFound} />
      </Switch>
      
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
