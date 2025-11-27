import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, Plus, User, BookOpen, MapPin, Video, MoreVertical, Edit, Trash, X } from 'lucide-react';
import AdminSkeleton from '../ui/AdminSkeleton';
import useAdminCacheStore from '../../store/adminCacheStore';
import weekendClassService from '../../services/weekendClassService';
import subjectService from '../../services/subjectService';
import instructorService from '../../services/instructorService';

const ClassScheduler = forwardRef((props, ref) => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingClasses, setEditingClasses] = useState(null); // Array of classes being edited
  
  // Form State
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '12:00',
    instructor: '',
    mode: 'Online',
    meetingLink: '',
    location: '',
    description: ''
  });

  // Batch Topics State
  const [sessionTopics, setSessionTopics] = useState([]); // Array of { subjectId, topicId, subjectName, topicName, _id (optional) }
  const [currentTopic, setCurrentTopic] = useState({ subject: '', topic: '' });

  const [topics, setTopics] = useState([]); // Topics for the currently selected subject in dropdown

  const { getCachedData, setCachedData } = useAdminCacheStore();
  const CACHE_KEY = 'weekend-classes-data';

  useImperativeHandle(ref, () => ({
    openModal: () => {
      resetForm();
      setShowModal(true);
    }
  }));

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentTopic.subject) {
      fetchTopics(currentTopic.subject);
    }
  }, [currentTopic.subject]);

  const fetchData = async () => {
    const cached = getCachedData(CACHE_KEY);
    
    if (cached) {
      setClasses(cached.data.classes);
      setSubjects(cached.data.subjects);
      setInstructors(cached.data.instructors);
      setLoading(false);
      
      if (!cached.isStale) return;
    }

    try {
      if (!cached) setLoading(true);
      const [classesData, subjectsData, instructorsData] = await Promise.all([
        weekendClassService.getAllClasses(),
        subjectService.getAllSubjects(),
        instructorService.getAllInstructors()
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
      setInstructors(instructorsData);
      
      setCachedData(CACHE_KEY, { 
        classes: classesData, 
        subjects: subjectsData, 
        instructors: instructorsData 
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const topicsData = await subjectService.getTopicsBySubject(subjectId);
      setTopics(topicsData);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (e) => {
    const { name, value } = e.target;
    setCurrentTopic(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTopic = () => {
    if (!currentTopic.subject || !currentTopic.topic) return;

    const subject = subjects.find(s => s._id === currentTopic.subject);
    const topic = topics.find(t => t._id === currentTopic.topic);

    setSessionTopics(prev => [
      ...prev,
      {
        subjectId: subject._id,
        topicId: topic._id,
        subjectName: subject.name,
        topicName: topic.name
      }
    ]);

    setCurrentTopic({ subject: '', topic: '' });
  };

  const handleRemoveTopic = (index) => {
    setSessionTopics(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sessionTopics.length === 0) {
      alert("Please add at least one topic to the session.");
      return;
    }

    try {
      // 1. Identify classes to delete (present in editingClasses but not in sessionTopics)
      if (editingClasses) {
        const keptIds = sessionTopics.map(t => t._id).filter(Boolean);
        const classesToDelete = editingClasses.filter(c => !keptIds.includes(c._id));
        
        await Promise.all(classesToDelete.map(c => weekendClassService.deleteClass(c._id)));
      }

      // 2. Create or Update classes
      const promises = sessionTopics.map(topic => {
        const classData = {
          ...formData,
          subject: topic.subjectId,
          topic: topic.topicId
        };

        if (topic._id) {
          return weekendClassService.updateClass(topic._id, classData);
        } else {
          return weekendClassService.createClass(classData);
        }
      });

      await Promise.all(promises);

      setShowModal(false);
      setEditingClasses(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Failed to save session. Please check for conflicts.");
    }
  };

  const handleDeleteSession = async () => {
    if (!editingClasses || !window.confirm("Are you sure you want to delete this entire session?")) return;

    try {
      await Promise.all(editingClasses.map(c => weekendClassService.deleteClass(c._id)));
      setShowModal(false);
      setEditingClasses(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleEdit = (dayClasses) => {
    if (!dayClasses || dayClasses.length === 0) return;
    
    const firstClass = dayClasses[0];
    setEditingClasses(dayClasses);
    
    setFormData({
      date: format(new Date(firstClass.date), 'yyyy-MM-dd'),
      startTime: firstClass.startTime,
      endTime: firstClass.endTime,
      instructor: firstClass.instructor?._id || '',
      mode: firstClass.mode,
      meetingLink: firstClass.meetingLink || '',
      location: firstClass.location || '',
      description: firstClass.description || ''
    });

    setSessionTopics(dayClasses.map(c => ({
      _id: c._id,
      subjectId: c.subject?._id,
      topicId: c.topic?._id,
      subjectName: c.subject?.name,
      topicName: c.topic?.name
    })));

    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '12:00',
      instructor: '',
      mode: 'Online',
      meetingLink: '',
      location: '',
      description: ''
    });
    setSessionTopics([]);
    setCurrentTopic({ subject: '', topic: '' });
  };

  // Upcoming Weekends Logic
  const getUpcomingWeekends = (startDate, count = 4) => {
    const weekends = [];
    let currentSaturday = new Date(startDate);
    if (currentSaturday.getDay() !== 6) {
      const daysUntilSaturday = (6 - currentSaturday.getDay() + 7) % 7;
      currentSaturday = addDays(currentSaturday, daysUntilSaturday);
    }
    
    for (let i = 0; i < count; i++) {
      const saturday = addDays(currentSaturday, i * 7);
      const sunday = addDays(saturday, 1);
      weekends.push({ saturday, sunday });
    }
    return weekends;
  };

  const getClassesForDay = (date) => {
    return classes.filter(cls => isSameDay(new Date(cls.date), date));
  };

  const upcomingWeekends = getUpcomingWeekends(selectedDate).filter(weekend => {
    const satClasses = getClassesForDay(weekend.saturday);
    const sunClasses = getClassesForDay(weekend.sunday);
    return satClasses.length > 0 || sunClasses.length > 0;
  });

  if (loading) {
    return <AdminSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Weekends List */}
      <div className="space-y-8">
        {upcomingWeekends.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Scheduled</h3>
            <p className="text-gray-500 mb-6">Get started by scheduling your first weekend class session.</p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Schedule Your First Session
            </button>
          </div>
        ) : (
          upcomingWeekends.map((weekend, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Weekend of {format(weekend.saturday, 'MMMM d')} - {format(weekend.sunday, 'MMMM d, yyyy')}
              </h3>
              
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                <div className="grid grid-cols-2 border-b border-gray-300 bg-gray-50">
                  <div className={`p-3 text-center border-r border-gray-300 ${isSameDay(weekend.saturday, new Date()) ? 'bg-blue-50' : ''}`}>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Saturday</p>
                    <p className={`text-sm font-bold ${isSameDay(weekend.saturday, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>{format(weekend.saturday, 'MMM d')}</p>
                  </div>
                  <div className={`p-3 text-center ${isSameDay(weekend.sunday, new Date()) ? 'bg-blue-50' : ''}`}>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Sunday</p>
                    <p className={`text-sm font-bold ${isSameDay(weekend.sunday, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>{format(weekend.sunday, 'MMM d')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[150px]">
                  {/* Saturday Column */}
                  <div className="border-b md:border-b-0 md:border-r border-gray-300 p-3 space-y-3 bg-white">
                    {getClassesForDay(weekend.saturday).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-4">
                        <p className="text-xs">No classes scheduled</p>
                      </div>
                    ) : (
                      <DaySessionCard 
                        classes={getClassesForDay(weekend.saturday)} 
                        onEdit={handleEdit} 
                      />
                    )}
                  </div>

                  {/* Sunday Column */}
                  <div className="p-3 space-y-3 bg-white">
                    {getClassesForDay(weekend.sunday).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-4">
                        <p className="text-xs">No classes scheduled</p>
                      </div>
                    ) : (
                      <DaySessionCard 
                        classes={getClassesForDay(weekend.sunday)} 
                        onEdit={handleEdit} 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingClasses ? 'Edit Session' : 'Schedule New Session'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Common Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Session Details</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                  <select
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value="">Select Instructor</option>
                    {instructors.map(i => <option key={i._id} value={i._id}>{i.firstName} {i.lastName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mode"
                        value="Online"
                        checked={formData.mode === 'Online'}
                        onChange={handleInputChange}
                        className="text-black focus:ring-black"
                      />
                      <span className="text-sm">Online</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mode"
                        value="Offline"
                        checked={formData.mode === 'Offline'}
                        onChange={handleInputChange}
                        className="text-black focus:ring-black"
                      />
                      <span className="text-sm">Offline</span>
                    </label>
                  </div>
                </div>

                {formData.mode === 'Online' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Room 101, Building A"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <hr className="border-gray-300" />

              {/* Topics Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Topics</h4>
                
                {/* Add Topic Form */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        name="subject"
                        value={currentTopic.subject}
                        onChange={handleTopicChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <select
                        name="topic"
                        value={currentTopic.topic}
                        onChange={handleTopicChange}
                        disabled={!currentTopic.subject}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none disabled:bg-gray-200"
                      >
                        <option value="">Select Topic</option>
                        {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    disabled={!currentTopic.subject || !currentTopic.topic}
                    className="w-full py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Topic to Session
                  </button>
                </div>

                {/* Topics List */}
                <div className="space-y-2">
                  {sessionTopics.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No topics added yet.</p>
                  ) : (
                    sessionTopics.map((topic, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-300">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Lesson {index + 1}: {topic.topicName}</p>
                          <p className="text-xs text-gray-500">{topic.subjectName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                {editingClasses ? (
                  <button
                    type="button"
                    onClick={handleDeleteSession}
                    className="px-4 py-2 text-sm font-medium bg-red-200 text-red-800 hover:bg-red-200 rounded-lg border border-transparent hover:border-red-400 transition-colors"
                  >
                    Delete Entire Session
                  </button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg"
                  >
                    {editingClasses ? 'Update Session' : 'Schedule Session'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default ClassScheduler;

function DaySessionCard({ classes, onEdit }) {
  // Calculate overall start and end time
  const sortedClasses = [...classes].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const startTime = sortedClasses[0]?.startTime;
  const endTime = sortedClasses[sortedClasses.length - 1]?.endTime;
  const instructor = sortedClasses[0]?.instructor; // Assuming same instructor for the day session
  const mode = sortedClasses[0]?.mode; // Assuming same mode

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 shadow-sm hover:shadow-md transition-all group relative border-l-4 border-l-black h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${mode === 'Online' ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-700'}`}>
          {mode}
        </span>
        
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">{startTime} - {endTime}</span>
          </div>
          <button 
            onClick={() => onEdit(classes)} 
            className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Session"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        {sortedClasses.map((cls, idx) => (
          <div key={cls._id} className="flex justify-between items-start group/item">
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-gray-900 truncate" title={cls.topic?.name}>
                Lesson {idx + 1}: {cls.topic?.name || 'No Topic'}
              </h4>
              <p className="text-xs text-gray-500 truncate">{cls.subject?.name || 'No Subject'}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-300 flex items-center gap-2 text-xs text-gray-600">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-medium">{instructor?.firstName || 'Unknown'} {instructor?.lastName || ''}</span>
      </div>
    </div>
  );
}
