import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import RouteDetails from "./RouteDetails";
import HeaderMid from "../HeaderMid";

const RouteDetailsPage = () => {
  const { foodId } = useParams();
  const [food, setFood] = useState(null);
  const [destinationUser, setDestinationUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        // Fetch the food item
        const res = await axiosInstance.get(`/donations/food/${foodId}`);
        const foodData = res.data;
        setFood(foodData);

        // Determine if it's pickup or delivery
        const isPickup = foodData.status === "assigned" || foodData.status === "pending";
        const targetId = isPickup
            ? foodData.buisiness_id?._id
            : foodData.donationId?.ngoId?._id;


        if (!targetId) {
          throw new Error("Destination user ID not found.");
        }

        // Fetch destination user by ID
        const userRes = await axiosInstance.get(`/user/${targetId}`);
        setDestinationUser(userRes.data);
      } catch (err) {
        console.error("Error fetching route details:", err);
      } finally {
        setLoading(false);
      }
    };

    // Get volunteer's browser location
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
      }
    );

    fetchRouteData();
  }, [foodId]);

  if (loading || !food || !destinationUser || !userLocation) {
    return <div className="text-center py-10">Loading route info...</div>;
  }

  return (
    <>
    <HeaderMid/>
    <RouteDetails
      food={food}
      destinationUser={destinationUser}
      userLocation={userLocation}
    />
    </>
  );
};

export default RouteDetailsPage;
