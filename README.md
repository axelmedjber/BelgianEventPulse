# BelgiumNow - Real-time Event Discovery

BelgiumNow is a web-based event discovery platform that helps users find cultural, social, and entertainment events happening across Belgian cities. The application displays events on an interactive map and provides filtering capabilities to help users discover events in their preferred cities.

## Screenshot
*The BelgiumNow interface displays an interactive map with events across Belgian cities, complete with city filtering functionality in the sidebar.*

## Features

- **Interactive Map View**: Events are plotted on a Mapbox-powered map with custom markers
- **City Filtering**: Filter events by major Belgian cities including Brussels, Antwerp, Ghent, Bruges, and more
- **Event Categories**: Browse events by categories such as music, art, food, sports, nightlife, cultural, and theater
- **Detailed Event Information**: View comprehensive details about each event including descriptions, times, locations, and organizer information
- **Dark/Light Theme Toggle**: Switch between dark and light theme based on your preference
- **Responsive Design**: Optimized for both desktop and mobile viewing

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Map Integration**: Mapbox GL JS for interactive maps
- **State Management**: TanStack Query (React Query) for data fetching
- **Backend**: Express.js server with in-memory data storage
- **Data Sources**: Integration with multiple event API providers including:
  - Brussels Open Data Portal
  - Eventbrite
  - Facebook Events
  - Meetup
  - Ticketmaster

## Getting Started

### Prerequisites

- Node.js (version 16 or later)
- npm or yarn package manager
- Mapbox API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/belgium-now.git
cd belgium-now
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5000`

## Usage

### Browsing Events

- The map automatically displays events across Belgium
- Click on map markers to see event details
- View the event list on the left sidebar
- Click on an event card to see more details and center the map on that event

### Filtering Events

- Use the city dropdown to filter events by specific Belgian cities
- The map will automatically recenter on the selected city

### Changing Map Style

- Use the map style dropdown to switch between Standard, Satellite, and Transit views
- The map style automatically adapts to match your selected theme (light/dark)

## Future Development

- User authentication for personalized event recommendations
- Event bookmarking and sharing functionality
- Calendar integration
- Advanced filtering by date and time
- User rating and review system

## Contributors

- [Your Name](https://github.com/yourusername)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Mapbox for the mapping technology
- Belgian event providers for data sources
- shadcn/ui for component library