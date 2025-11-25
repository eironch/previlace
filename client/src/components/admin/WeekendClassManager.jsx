import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Link, Save, AlertCircle, CheckCircle } from 'lucide-react';
import weekendClassService from '../../services/weekendClassService';

export default function WeekendClassManager() {
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: ''
  });

  useEffect(() => {
    fetchUpcomingClass();
  }, []);

  const fetchUpcomingClass = async () => {
    try {
      setLoading(true);
      const data = await weekendClassService.getUpcomingClass();
      setUpcomingClass(data);
      if (data) {
        setFormData({
          topic: data.topic?.name || data.topic,
          description: data.description || '',
          date: new Date(data.date).toISOString().split('T')[0],
          startTime: data.startTime,
          endTime: data.endTime,
          meetingLink: data.meetingLink || ''
        });
      }
    } catch (error) {
      console.error("Error fetching class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await weekendClassService.createOrUpdateClass(formData);
      setMessage({ type: 'success', text: 'Weekend class scheduled successfully!' });
      fetchUpcomingClass();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to schedule class. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Weekend Class
        </h2>
        
        {message && (
          <div className={`p-4 mb-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Numerical Reasoning Mastery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Brief description of what will be covered..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  placeholder="10:00 AM"
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  placeholder="12:00 PM"
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
            <div className="relative">
              <Link className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="https://zoom.us/j/..."
                className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full md:w-auto rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Schedule Class'}
            </button>
          </div>
        </form>
      </div>

      {upcomingClass && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current Scheduled Class</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg">{upcomingClass.topic?.name || upcomingClass.topic}</h4>
                <p className="text-gray-600 mt-1">{upcomingClass.description}</p>
                <div className="mt-3 flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(upcomingClass.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {upcomingClass.startTime} - {upcomingClass.endTime}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${upcomingClass.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {upcomingClass.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
