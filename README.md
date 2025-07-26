// Trip script


// To dos

- [x] Auth setup using clerk
- [x] Basic landing and dashboard pages
- [x] Clerk webhook usign ngrok to get the user in the db on signup
- [x] intial trip info(location, dates) in db 
- [x] create a working page where the user will be able to plan the trip)it takes the start and end date to scaffold the intial page
        - [x] create a card components to display each day, it should have the date at the top and a text box to right the description
        - Update 1. trying to figure out the right way to pass the date info to the page. learned that in nextjs we can use the page.tsx as a server and pass the props to it and just create and return a client component 
        - Update 2. refactored, added the componen, getting trip id and showing the itenarary also
        - Update 3. Added itenaries to the schema and updated the relations
        - next -
- [ ] create the actions for adding, deleting places.
- [ ] bring in googel maps/mapbox to the page and connect it to show the initial page that the user gave
- [ ] 