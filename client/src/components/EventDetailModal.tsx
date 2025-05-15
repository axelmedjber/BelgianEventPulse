import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Calendar, MapPin, Heart, Share, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { Event } from "@/lib/types";
import { format } from "date-fns";

interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const formatEventDate = (date: Date) => {
    return format(date, "MMMM do, yyyy");
  };

  const formatEventTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Modal header with image */}
        <div className="relative">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-64 object-cover"
          />
          <Button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 h-8 w-8"
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Modal content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-[#FAE042] text-sm font-semibold rounded-full text-[#333333] mb-2">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            <h2 className="font-roboto font-bold text-2xl">{event.title}</h2>
            <p className="text-gray-600">{event.location}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-roboto font-medium text-lg mb-2">Date & Time</h3>
              <div className="flex items-start">
                <Calendar className="mt-1 mr-3 text-[#003F8C] h-5 w-5" />
                <div>
                  <p className="font-semibold">{formatEventDate(new Date(event.date))}</p>
                  <p className="text-gray-600">{formatEventTime(new Date(event.date))} - {formatEventTime(new Date(event.endDate || event.date))}</p>
                  <p className="text-sm text-gray-500 mt-1">Doors open 30 minutes before</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-roboto font-medium text-lg mb-2">Location</h3>
              <div className="flex items-start">
                <MapPin className="mt-1 mr-3 text-[#003F8C] h-5 w-5" />
                <div>
                  <p className="font-semibold">{event.venue || event.location.split(',')[0]}</p>
                  <p className="text-gray-600">{event.location}</p>
                  <p className="text-sm text-[#E41E31] underline cursor-pointer mt-1">View on map</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-roboto font-medium text-lg mb-2">About This Event</h3>
            <p className="text-gray-700 mb-3">{event.description}</p>
            {event.longDescription && event.longDescription.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 mb-3">{paragraph}</p>
            ))}
          </div>
          
          <div className="mb-6">
            <h3 className="font-roboto font-medium text-lg mb-2">Organizer</h3>
            <div className="flex items-center">
              <img 
                src={event.organizerImageUrl || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
                alt="Organizer profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-semibold">{event.organizer}</p>
                <p className="text-sm text-gray-600">Event Organizer</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-roboto font-medium text-lg mb-2">Share This Event</h3>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" className="bg-[#3b5998] text-white p-2 rounded-full border-0 h-9 w-9">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-[#1da1f2] text-white p-2 rounded-full border-0 h-9 w-9">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-[#0077b5] text-white p-2 rounded-full border-0 h-9 w-9">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-gray-200 text-[#333333] p-2 rounded-full border-0 h-9 w-9">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
