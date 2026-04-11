import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  freshness_score: number;
  freshness_status: "fresh" | "at_risk" | "spoiled";
  confidence: number;
  detected_at: string;
  estimated_days_to_spoil: number | null;
  storage_tips: string[] | null;
}

interface SensorReading {
  id: string;
  humidity: number | null;
  temperature: number | null;
  gas_value: number | null;
  recorded_at: string;
  food_item_id: string | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  is_read: boolean;
  created_at: string;
  food_item_id: string | null;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    const [itemsRes, readingRes, notifsRes] = await Promise.all([
      supabase.from("food_items").select("*").order("detected_at", { ascending: false }),
      supabase.from("sensor_readings").select("*").order("recorded_at", { ascending: false }).limit(1),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    ]);

    if (itemsRes.data) setFoodItems(itemsRes.data as FoodItem[]);
    if (readingRes.data && readingRes.data.length > 0) setLatestReading(readingRes.data[0] as SensorReading);
    if (notifsRes.data) setNotifications(notifsRes.data as Notification[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Real-time subscriptions
    const foodChannel = supabase
      .channel("food-items-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "food_items" }, () => fetchData())
      .subscribe();

    const sensorChannel = supabase
      .channel("sensor-readings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "sensor_readings" }, () => fetchData())
      .subscribe();

    const notifChannel = supabase
      .channel("notifications-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(foodChannel);
      supabase.removeChannel(sensorChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user]);

  const freshCount = foodItems.filter((i) => i.freshness_status === "fresh").length;
  const atRiskCount = foodItems.filter((i) => i.freshness_status === "at_risk").length;
  const spoiledCount = foodItems.filter((i) => i.freshness_status === "spoiled").length;
  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;

  return { foodItems, latestReading, notifications, loading, freshCount, atRiskCount, spoiledCount, unreadNotifCount, refetch: fetchData };
};
