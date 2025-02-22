// app/root/modify/admin/page.tsx
"use client";
// app/root/modify/admin/page.tsx

import { useState, useEffect } from 'react';
import React from 'react';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

export default function AdminPage() {
    const [headline, setHeadline] = useState('');
    const [article, setArticle] = useState('');
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch('/modify?type=content', { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    setHeadline(data.headline);
                    setArticle(data.article);
                } else {
                    console.error('Failed to fetch content');
                }
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        }

        async function fetchFaqs() {
            try {
                const res = await fetch('/modify?type=faq', { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    setFaqs(data);
                } else {
                    console.error('Failed to fetch FAQs');
                }
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            }
        }

        fetchContent();
        fetchFaqs();
    }, []);

    const handleContentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetch('/modify?type=content', {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                body: JSON.stringify({ headline, article }),
            });
            console.log("response", res)
            if (res.ok) {
                alert('Content updated successfully');
            } else {
                console.error('Failed to update content');
            }
        } catch (error) {
            console.error('Error updating content:', error);
        }
    };

    const handleFaqSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetch('/modify?type=faq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newFaq),
            });

            if (res.ok) {
                alert('FAQ added successfully');
                setNewFaq({ question: '', answer: '' });
                const data = await res.json();
                setFaqs(data);
            } else {
                console.error('Failed to add FAQ');
            }
        } catch (error) {
            console.error('Error adding FAQ:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'headline') {
            setHeadline(value);
        } else if (name === 'article') {
            setArticle(value);
        } else if (name === 'question') {
            setNewFaq({ ...newFaq, question: value });
        } else if (name === 'answer') {
            setNewFaq({ ...newFaq, answer: value });
        }
    };

    return (
        <div>
            <h1>Admin Page</h1>

            <form onSubmit={handleContentSubmit}>
                <h2>Update Content</h2>
                <div>
                    <label>Headline</label>
                    <input
                        type="text"
                        name="headline"
                        value={headline}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Article</label>
                    <textarea
                        name="article"
                        value={article}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit">Update Content</button>
            </form>

            <form onSubmit={handleFaqSubmit}>
                <h2>Add FAQ</h2>
                <div>
                    <label>Question</label>
                    <input
                        type="text"
                        name="question"
                        value={newFaq.question}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Answer</label>
                    <textarea
                        name="answer"
                        value={newFaq.answer}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit">Add FAQ</button>
            </form>

            <h2>Current FAQs</h2>
            <ul>
                {faqs.map((faq) => (
                    <li key={faq.id}>
                        <strong>{faq.question}</strong>: {faq.answer}
                    </li>
                ))}
            </ul>
        </div>
    );
}
