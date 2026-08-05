import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, PlusCircle, Search, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Community = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userRole } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'community_posts'));
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return toast.error('Fill all fields');

    try {
      await addDoc(collection(db, 'community_posts'), {
        authorId: currentUser.uid,
        author: currentUser.displayName || currentUser.email || 'Anonymous',
        authorRole: userRole,
        title,
        content,
        likes: 0,
        comments: 0,
        tags: [],
        createdAt: new Date().toISOString()
      });
      toast.success('Post published!');
      setShowPostForm(false);
      setTitle('');
      setContent('');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to publish post');
    }
  };

  const handleLike = async (post) => {
    try {
      await updateDoc(doc(db, 'community_posts', post.id), {
        likes: post.likes + 1
      });
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Health</h1>
          <p className="text-gray-500 mt-1">Discuss health topics and share wellness tips.</p>
        </div>
        <button 
          onClick={() => setShowPostForm(!showPostForm)}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          {showPostForm ? 'Cancel' : <><PlusCircle className="h-4 w-4 mr-2" /> New Post</>}
        </button>
      </div>

      {showPostForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <form className="space-y-4" onSubmit={handlePost}>
            <div>
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Post Title..." className="w-full text-lg font-semibold rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-3" />
            </div>
            <div>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4} placeholder="What's on your mind? Ask a question or share a tip..." className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-3"></textarea>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                Publish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center">
             <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-10 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            No community posts yet. Be the first to post!
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${post.authorRole === 'doctor' ? 'bg-secondary' : 'bg-gray-400'}`}>
                  {post.author?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm capitalize">{post.author} ({post.authorRole})</h4>
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.content}</p>

              <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                <button onClick={() => handleLike(post)} className="flex items-center text-gray-500 hover:text-primary transition-colors text-sm font-medium">
                  <ThumbsUp className="w-4 h-4 mr-1.5" /> {post.likes || 0} Likes
                </button>
                <button className="flex items-center text-gray-500 hover:text-primary transition-colors text-sm font-medium">
                  <MessageSquare className="w-4 h-4 mr-1.5" /> {post.comments || 0} Comments
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
