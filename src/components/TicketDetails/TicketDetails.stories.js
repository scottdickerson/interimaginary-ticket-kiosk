import TicketDetails from './TicketDetails';
import { destinations } from './sampleData.js';

const story = {
  title: 'components/TicketDetails',
  component: TicketDetails,
};

export const Default = () => (
  <TicketDetails
    ticketDestination="Abame"
    ticketURL="http://interimaginarydepartures.com/hyperborea/"
  />
);

// Show all the possible ticket images on one screen
export const AllTicketScreens = () => {
  return destinations.map(ticket => (
    <TicketDetails ticketDestination={ticket.DESTINATION} ticketURL={ticket.URL} />
  ));
};

export default story;
