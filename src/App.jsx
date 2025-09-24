import { Outlet } from "react-router"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { useEffect } from "react";
import useThemeStore from "./store/themeStore";

function App() {
  const theme = useThemeStore((state) => state.theme);

  // Effect to apply the theme to the root html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex h-dvh flex-col justify-between p-2">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default App
