import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../store/slices/authSlice";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUser());
    }
  }, [token, user, dispatch]);

  if (loading && !user) {
    return <Loader fullPage />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
