import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Plus, Edit, Trash, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import subjectService from '../../services/subjectService';
import AdminSkeleton from '../ui/AdminSkeleton';

const SubjectManager = forwardRef((props, ref) => {
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [topics, setTopics] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '', examLevel: 'Professional' });
  const [topicForm, setTopicForm] = useState({ name: '', code: '', description: '', difficulty: 'Intermediate' });

  useImperativeHandle(ref, () => ({
    openSubjectModal: () => {
      setEditingSubject(null);
      setSubjectForm({ name: '', code: '', description: '', examLevel: 'Professional' });
      setShowSubjectModal(true);
    }
  }));

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const data = await subjectService.getTopicsBySubject(subjectId);
      setTopics(prev => ({ ...prev, [subjectId]: data }));
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const toggleSubject = (subjectId) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subjectId);
      if (!topics[subjectId]) {
        fetchTopics(subjectId);
      }
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, subjectForm);
      } else {
        await subjectService.createSubject(subjectForm);
      }
      setShowSubjectModal(false);
      setEditingSubject(null);
      setSubjectForm({ name: '', code: '', description: '', examLevel: 'Professional' });
      fetchSubjects();
    } catch (error) {
      console.error("Error saving subject:", error);
    }
  };

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        await subjectService.updateTopic(editingTopic._id, topicForm);
      } else {
        await subjectService.createTopic({ ...topicForm, subjectId: selectedSubjectId });
      }
      setShowTopicModal(false);
      setEditingTopic(null);
      setTopicForm({ name: '', code: '', description: '', difficulty: 'Intermediate' });
      fetchTopics(selectedSubjectId);
    } catch (error) {
      console.error("Error saving topic:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Subjects & Topics</h2>
      </div>

      {loading ? (
        <AdminSkeleton showHeader={false} />
      ) : (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
        {subjects.map(subject => (
          <div key={subject._id} className="border-b border-gray-300 last:border-b-0">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleSubject(subject._id)}>
                {expandedSubject === subject._id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-xs text-gray-500">{subject.code} • {subject.examLevel}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedSubjectId(subject._id); setEditingTopic(null); setTopicForm({ name: '', code: '', description: '', difficulty: 'Intermediate' }); setShowTopicModal(true); }}
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg"
                  title="Add Topic"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditingSubject(subject); setSubjectForm(subject); setShowSubjectModal(true); }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedSubject === subject._id && (
              <div className="bg-gray-50 px-4 pb-4 pt-2 space-y-2">
                {topics[subject._id]?.map(topic => (
                  <div key={topic._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-300 ml-8">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900">{topic.name}</h4>
                      <p className="text-xs text-gray-500">{topic.code} • {topic.difficulty}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingTopic(topic); setSelectedSubjectId(subject._id); setTopicForm(topic); setShowTopicModal(true); }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!topics[subject._id] || topics[subject._id].length === 0) && (
                  <p className="text-sm text-gray-500 ml-8 italic">No topics found.</p>
                )}
              </div>

            )}
          </div>
        ))}
      </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <input type="text" placeholder="Name" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className="w-full border p-2 rounded" required />
              <input type="text" placeholder="Code" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} className="w-full border p-2 rounded" required />
              <textarea placeholder="Description" value={subjectForm.description} onChange={e => setSubjectForm({...subjectForm, description: e.target.value})} className="w-full border p-2 rounded" />
              <select value={subjectForm.examLevel} onChange={e => setSubjectForm({...subjectForm, examLevel: e.target.value})} className="w-full border p-2 rounded">
                <option value="Professional">Professional</option>
                <option value="Sub-Professional">Sub-Professional</option>
                <option value="Both">Both</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingTopic ? 'Edit Topic' : 'Add Topic'}</h3>
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <input type="text" placeholder="Name" value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} className="w-full border p-2 rounded" required />
              <input type="text" placeholder="Code" value={topicForm.code} onChange={e => setTopicForm({...topicForm, code: e.target.value})} className="w-full border p-2 rounded" required />
              <textarea placeholder="Description" value={topicForm.description} onChange={e => setTopicForm({...topicForm, description: e.target.value})} className="w-full border p-2 rounded" />
              <select value={topicForm.difficulty} onChange={e => setTopicForm({...topicForm, difficulty: e.target.value})} className="w-full border p-2 rounded">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTopicModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default SubjectManager;
