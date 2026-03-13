import "../src/index.css";
import "../src/TripDetail.css";
import ActivityTracker from "../src/components/ActivityTracker";
import SiteFooter from "../src/components/SiteFooter";

export default function TourguideApp({ Component, pageProps }) {
  return (
    <>
      <ActivityTracker />
      <Component {...pageProps} />
      <SiteFooter />
    </>
  );
}