import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { FiTrendingUp, FiUsers, FiPackage, FiCalendar, FiArrowLeft, FiPieChart } from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { format, parseISO, subDays, subMonths } from "date-fns";

const CampaignAnalytics = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalFoodItems: 0,
    totalVolunteers: 0,
    averageImpactScore: 0
  });
  
  // Data for category distribution (example data)
  const [foodCategories, setFoodCategories] = useState([
    { name: "Canned", value: 12 },
    { name: "Fresh", value: 25 },
    { name: "Grains", value: 18 },
    { name: "Dairy", value: 8 },
    { name: "Other", value: 15 }
  ]);

  useEffect(() => {
    const fetchAllCampaignsData = async () => {
      try {
        setLoading(true);
        // Get user info to fetch their campaigns
        const userRes = await axiosInstance.get("/user-details");
        const userId = userRes.data?.data?._id;
        
        if (!userId) {
          throw new Error("User ID not found");
        }
        
        // Fetch all campaigns for this user
        const response = await axiosInstance.get(`/donations/get-donation-by-id/${userId}`);
        setCampaigns(response.data || []);
        
        // Generate analytics based on all campaigns
        generateAggregateAnalytics(response.data || []);
      } catch (err) {
        console.error("Error fetching campaigns data:", err);
        setError("Failed to load campaigns data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCampaignsData();
  }, []);

  const generateAggregateAnalytics = (campaignsData) => {
    if (!campaignsData.length) return;

    // Calculate overall stats
    const now = new Date();
    const totalFoodItems = campaignsData.reduce((total, camp) => 
      total + (camp.foods?.length || 0), 0);
    
    // Count unique volunteers
    const volunteerIds = new Set();
    campaignsData.forEach(camp => {
      if (camp.volunteers?.length) {
        camp.volunteers.forEach(vol => {
          const volId = typeof vol === 'object' ? vol._id : vol;
          if (volId) volunteerIds.add(volId);
        });
      }
    });
    
    const activeCampaigns = campaignsData.filter(camp => 
      camp.endingDate && new Date(camp.endingDate) > now
    ).length;
    
    const totalImpactScore = campaignsData.reduce((total, camp) => 
      total + (camp.impactScore || 0), 0);
    const averageImpactScore = campaignsData.length > 0 
      ? Math.round(totalImpactScore / campaignsData.length)
      : 0;
    
    setTotalStats({
      totalCampaigns: campaignsData.length,
      activeCampaigns,
      totalFoodItems,
      totalVolunteers: volunteerIds.size,
      averageImpactScore
    });

    // Generate monthly data for trend charts - last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      // Filter campaigns created in this month
      const monthCampaigns = campaignsData.filter(camp => {
        const createdAt = new Date(camp.createdAt);
        return createdAt >= monthStartDate && createdAt <= monthEndDate;
      });
      
      // Calculate totals for this month
      const monthFoodItems = monthCampaigns.reduce((total, camp) => 
        total + (camp.foods?.length || 0), 0);
      
      const monthImpactScores = monthCampaigns.map(camp => camp.impactScore || 0);
      const avgImpactScore = monthImpactScores.length 
        ? monthImpactScores.reduce((sum, score) => sum + score, 0) / monthImpactScores.length
        : 0;
      
      monthlyData.push({
        month: format(monthDate, 'MMM yyyy'),
        campaigns: monthCampaigns.length,
        foodItems: monthFoodItems,
        avgImpact: Math.round(avgImpactScore)
      });
    }
    
    setAnalyticsData(monthlyData);
  };

  // Colors for chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <>
        <HeaderMid />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderMid />
        <div className="flex flex-col justify-center items-center h-screen">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/my-campaigns" className="btn btn-primary">
            Back to Campaigns
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/my-campaigns" className="inline-flex items-center text-green-600 hover:text-green-700">
              <FiArrowLeft className="mr-2" /> Back to Campaigns
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Campaign Analytics Overview</h1>
                <p className="text-gray-500">
                  Summary of all your donation campaigns
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <RiLeafLine className="mr-2" />
                Average Impact Score: {totalStats.averageImpactScore}
              </div>
            </div>
          </motion.div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <FiTrendingUp className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Campaigns</p>
                  <h3 className="text-2xl font-bold text-gray-800">{totalStats.totalCampaigns}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FiPackage className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Food Items</p>
                  <h3 className="text-2xl font-bold text-gray-800">{totalStats.totalFoodItems}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <FiUsers className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Volunteers</p>
                  <h3 className="text-2xl font-bold text-gray-800">{totalStats.totalVolunteers}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                  <FiCalendar className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Active Campaigns</p>
                  <h3 className="text-2xl font-bold text-gray-800">{totalStats.activeCampaigns}</h3>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Monthly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Campaign Activity (Last 6 Months)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
                      border: 'none' 
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="avgImpact" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2} 
                    activeDot={{ r: 8 }} 
                    name="Average Impact Score"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="foodItems" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2} 
                    activeDot={{ r: 6 }} 
                    name="Food Items Collected"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="campaigns" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2} 
                    activeDot={{ r: 6 }} 
                    name="Campaigns Started"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Two charts in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Food Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Food Category Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={foodCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {foodCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Impact Score by Campaign */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Impact Score by Campaign</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={campaigns.slice(0, 5).map(c => ({
                      name: c.name.length > 10 ? c.name.substring(0, 10) + '...' : c.name,
                      impact: c.impactScore || 0
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impact" name="Impact Score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Campaigns Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Items</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.slice(0, 5).map((campaign) => {
                    const isActive = new Date(campaign.endingDate) > new Date();
                    return (
                      <tr key={campaign._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {campaign.foods?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.impactScore || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isActive ? 'Active' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CampaignAnalytics;
