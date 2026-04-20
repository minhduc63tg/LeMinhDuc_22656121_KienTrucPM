// src/hooks/useNotifications.js
import { useState, useEffect, useRef } from 'react';
import { notificationApi } from '../api/services';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const esRef = useRef(null);

  // Load initial notifications
  useEffect(() => {
    notificationApi.getAll()
      .then((r) => setNotifications(r.data.data || []))
      .catch(() => {});
  }, []);

  // Connect SSE for real-time updates
  useEffect(() => {
    const es = new EventSource(notificationApi.streamUrl());
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const notif = JSON.parse(e.data);
        setNotifications((prev) => [notif, ...prev].slice(0, 50));
      } catch (_) {}
    };

    es.onerror = () => {
      // SSE sẽ tự reconnect, không cần làm gì
    };

    return () => es.close();
  }, []);

  return notifications;
}
