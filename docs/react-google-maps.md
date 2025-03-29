# Google Maps Integration

This document provides information about the Google Maps API integration in the application.

## Libraries and Setup

- The application uses `@googlemaps/js-api-loader` to load the Google Maps API scripts.
- We use the Autocomplete API from Google Maps Places library to handle address autocomplete.
- The API key should be configured in the environment variables as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## API Key Configuration

The Google Maps API key needs to be configured with the following services enabled:

- Maps JavaScript API
- Places API
- Geocoding API

## Google Maps Autocomplete

In our `RestaurantInfoForm.tsx`, we use the Places Autocomplete to help users enter their restaurant address:

```jsx
const autocomplete = new google.maps.places.Autocomplete(
  autocompleteRef.current,
  {
    types: ['address'],
    componentRestrictions: {
      country: ['fr'],
    },
    fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
  },
)
```

When a place is selected, we extract and store:

1. The full formatted address
2. Individual address components (street, city, state, zip, country)
3. The latitude and longitude coordinates

## Database Storage

Address information is stored in the `Address` model with the following fields:

- `addressFormatted`: The full formatted address from Google
- `street`, `city`, `state`, `zip`, `country`: Individual address components
- `latitude`, `longitude`: Geographic coordinates from Google Maps

## Usage Notes

1. Always request the `geometry` field when using Autocomplete to ensure you get coordinates
2. Don't forget to include the Places library when loading the Google Maps API:
   ```js
   const loader = new Loader({
     apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
     version: 'weekly',
     libraries: ['places'],
   })
   ```
3. For security reasons, we restrict the autocomplete to specific countries (fr, gb, us, es, it, de)
