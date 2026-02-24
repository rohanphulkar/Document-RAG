import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { LogOut, User, FolderOpen, MessageSquare, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NavLinks = ({ onNavigate }) => (
    <>
      <Link to="/" onClick={onNavigate} className="w-full">
        <Button
          variant={isActive("/") ? "secondary" : "ghost"}
          className={`w-full justify-start gap-2 ${
            isActive("/") ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Chats
        </Button>
      </Link>
      <Link to="/collections" onClick={onNavigate} className="w-full">
        <Button
          variant={isActive("/collections") ? "secondary" : "ghost"}
          className={`w-full justify-start gap-2 ${
            isActive("/collections") ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          Collections
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="ContextBase"
              className="h-8 w-8 logo-icon"
            />
            <span className="text-xl font-bold text-primary">ContextBase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Desktop User Dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm font-medium max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img
                      src="/logo.svg"
                      alt="ContextBase"
                      className="h-6 w-6 logo-icon"
                    />
                    ContextBase
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <NavLinks />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
