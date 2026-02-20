import React, { useState, useEffect } from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";
import {
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineSearch,
  HiChevronDown,
} from "react-icons/hi";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Searchbar from "./Searchbar";

const navItems = [
  { name: "Shop", path: "/shop" },
  { name: "Categories", path: "/categories" },
  { name: "New Arrivals", path: "/new-arrivals" },
  { name: "Best Sellers", path: "/best-sellers" },
  { name: "About", path: "/about" },
];

function Navig() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);

  const { cartItems, setIsCartOpen } = useCart();
  const location = useLocation();

  // scroll + categories
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const cats = new Set();
        querySnapshot.forEach((doc) => {
          if (doc.data().category) cats.add(doc.data().category);
        });
        setCategories(Array.from(cats));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    window.addEventListener("scroll", handleScroll);
    fetchCategories();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // lock scroll when mobile menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full transition-all duration-300 z-[70] ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-100 py-3 md:py-4"
          : "bg-transparent py-6 md:py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between relative">
        <Searchbar
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        {/* Brand Logo */}
        <Link
          to="/"
          className="relative z-[80]"
          onClick={() => setOpen(false)}
        >
          <img
            src="/glownaturalslogo.png"
            alt="Glow Naturals"
            className="h-12 md:h-16 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group/nav">
                <Link
                  to={item.path}
                  className={`text-[13px] font-bold uppercase tracking-[0.2em] transition-all hover:text-admin-primary flex items-center gap-1 ${
                    location.pathname === item.path
                      ? "text-admin-primary"
                      : "text-gray-400"
                  }`}
                >
                  {item.name}
                  {item.name === "Categories" && (
                    <HiChevronDown className="transition-transform group-hover/nav:rotate-180" />
                  )}
                </Link>

                {item.name === "Categories" &&
                  categories.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 min-w-[240px] opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all z-50">
                      <div className="bg-white border border-gray-100 shadow-2xl py-8 px-10 rounded-none">
                        <div className="grid gap-4">
                          {categories.map((cat) => (
                            <Link
                              key={cat}
                              to={`/shop?search=${encodeURIComponent(
                                cat
                              )}`}
                              className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-admin-primary transition-colors border-l-2 border-transparent hover:border-admin-primary pl-3"
                            >
                              {cat}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 border-l border-gray-100 pl-8 ml-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-400 hover:text-admin-primary transition p-2"
            >
              <HiOutlineSearch size={20} />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative group py-2"
            >
              <HiOutlineShoppingBag
                size={20}
                className="text-gray-400 group-hover:text-admin-primary transition"
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-admin-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              to="/profile"
              className="py-2 text-gray-400 hover:text-admin-primary transition"
            >
              <HiOutlineUser size={20} />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden flex items-center gap-5 relative z-[80]">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-gray-900 p-1"
          >
            <HiOutlineSearch size={20} />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1"
          >
            <HiOutlineShoppingBag
              size={22}
              className="text-gray-900"
            />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-admin-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen((prev) => !prev)}
            className="text-gray-900 p-1 ml-1"
          >
            {open ? (
              <HiOutlineX size={24} />
            ) : (
              <HiOutlineMenuAlt3 size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`fixed inset-0 bg-white transition-all duration-500 ease-in-out px-10 pt-28 lg:hidden flex flex-col z-40 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar pb-10">
          {navItems.map((item, index) => (
            <div key={item.name} className="space-y-4">
              {item.name === "Categories" ? (
                <>
                  <button
                    onClick={() =>
                      setMobileCatsOpen((prev) => !prev)
                    }
                    className={`w-full text-left text-4xl font-serif font-medium text-gray-900 flex items-center justify-between transition-all transform ${
                      open
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    {item.name}
                    <HiChevronDown
                      className={`transition-transform duration-300 ${
                        mobileCatsOpen ? "rotate-180" : ""
                      }`}
                      size={24}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 grid gap-4 pl-4 border-l border-gray-100 ${
                      mobileCatsOpen
                        ? "max-h-96 opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/shop?search=${encodeURIComponent(
                          cat
                        )}`}
                        onClick={() => setOpen(false)}
                        className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-admin-primary"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => {
                    setOpen(false);
                    setMobileCatsOpen(false);
                  }}
                  className={`block text-4xl font-serif font-medium text-gray-900 transition-all transform ${
                    open
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="py-10 border-t border-gray-100 mt-auto">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-admin-primary transition-all rounded-none"
          >
            <HiOutlineUser size={16} />
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navig;
