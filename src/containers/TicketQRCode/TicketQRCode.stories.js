import TicketQRCode from './TicketQRCode';

const story = {
  title: 'components/TicketQRCode',
  component: TicketQRCode,
};

export const SimpleQRCode = () => (
  <TicketQRCode url="http://interimaginarydepartures.com/groverscorners/" />
);

export default story;
