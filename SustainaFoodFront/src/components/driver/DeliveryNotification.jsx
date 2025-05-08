import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axiosInstance';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const DeliveryNotification = ({ notification, onAccept, onReject }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Guard against undefined notification
  if (!notification) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 mb-4 border-l-4 border-gray-500">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">Invalid Notification</h3>
            <p className="text-sm text-gray-600">Notification data is missing</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Use optional chaining for safe property access
  const orderId = notification?.data?.orderId;
  
  // Calculate remaining time (2 min from notification time)
  const createdAt = notification?.createdAt ? new Date(notification.createdAt) : new Date();
  const expiresAt = new Date(createdAt.getTime() + 2 * 60 * 1000);
  const now = new Date();
  const remainingMs = expiresAt - now;
  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  
  // Format remaining time as MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  const handleAccept = async () => {
    if (!user || !user._id || !orderId) {
      toast.error('Cannot accept: Missing user ID or order ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/driver/accept-delivery/${orderId}`, {
        driverId: user._id
      });
      
      if (response.data.success) {
        toast.success('Delivery accepted! Get ready to pick up.');
        if (onAccept) onAccept(notification);
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast.error('Failed to accept delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!user || !user._id || !orderId) {
      toast.error('Cannot reject: Missing user ID or order ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/driver/reject-delivery/${orderId}`, {
        driverId: user._id
      });
      
      if (response.data.success) {
        toast.info('Delivery rejected.');
        if (onReject) onReject(notification);
      }
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      toast.error('Failed to reject delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // If notification has expired, show expired state
  if (remainingMs <= 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 mb-4 border-l-4 border-gray-500">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">Delivery Assignment Expired</h3>
            <p className="text-sm text-gray-600">This assignment is no longer available</p>
          </div>
          <div className="text-gray-500">
            <FiClock size={24} />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-blue-800">New Delivery Assignment!</h3>
        <div className="flex items-center bg-blue-200 px-2 py-1 rounded">
          <FiClock className="mr-1" />
          <span className="text-sm font-medium">{timeDisplay}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">
        {notification?.message || 'You have a new delivery assignment'}
      </p>
      
      {notification?.data && (
        <div className="text-xs text-gray-600 mb-3">
          <p><strong>Address:</strong> {notification.data.customerAddress?.street || 'N/A'}, {notification.data.customerAddress?.city || 'N/A'}</p>
          <p><strong>Order:</strong> {notification.data.orderDetails?.items || '?'} items, ${notification.data.orderDetails?.totalPrice || '0.00'}</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleReject}
          disabled={loading || !orderId}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded flex items-center"
        >
          <FiX className="mr-1" /> Reject
        </button>
        <button
          onClick={handleAccept}
          disabled={loading || !orderId}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center"
        >
          <FiCheck className="mr-1" /> Accept
        </button>
      </div>
      
      {loading && (
        <div className="text-center mt-2">
          <span className="loading loading-spinner loading-sm"></span>
          <span className="ml-2 text-xs">Processing...</span>
        </div>
      )}
    </div>
  );
};

export default DeliveryNotification;