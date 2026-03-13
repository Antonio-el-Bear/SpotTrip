import React from "react";

const MOBILE_MAX = 767;
const TABLET_MAX = 1023;

export default function useViewport() {
  const [width, setWidth] = React.useState(1280);

  React.useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return function cleanup() {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    width,
    isMobile: width <= MOBILE_MAX,
    isTablet: width <= TABLET_MAX,
    isDesktop: width > TABLET_MAX,
  };
}