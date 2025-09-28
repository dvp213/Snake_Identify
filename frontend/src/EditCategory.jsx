import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './styles/EditCategory.css';

function EditCategory() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { category, existingData } = location.state || {};

    const [formData, setFormData] = useState({
        englishDescription: existingData?.snakeenglishdescription || '',
        sinhalaDescription: existingData?.snakesinhaladescription || '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(existingData?.snakeimage || null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Map category ID to numeric class label (0-4)
            const categoryToNumericClass = {
                'ceylonkrait': '0',
                'cobra': '1',
                'commonkrait': '2',
                'russellsviper': '3',
                'sawscaledviper': '4'
            };

            // Create snake data as a JSON string
            const snakeData = {
                class_label: categoryToNumericClass[category.id],
                snakeenglishname: category.englishName,
                snakesinhalaname: category.sinhalaName,
                snakeenglishdescription: formData.englishDescription,
                snakesinhaladescription: formData.sinhalaDescription
            };

            // Create form data
            const formDataToSend = new FormData();
            formDataToSend.append('snake_data', JSON.stringify(snakeData));

            if (!formData.image) {
                throw new Error('Please select an image');
            }
            formDataToSend.append('image', formData.image);

            console.log('Sending request to:', 'http://localhost:8000/snake/add');
            console.log('Form data:', Object.fromEntries(formDataToSend.entries()));

            console.log('Token being sent:', token);
            const response = await fetch(
                existingData
                    ? `http://localhost:8000/snake/update/${existingData.snakeid}`
                    : 'http://localhost:8000/snake/add',
                {
                    method: existingData ? 'PUT' : 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include',
                    mode: 'cors',
                    body: formDataToSend,
                }
            );

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Server response was not valid JSON: ' + responseText);
            }

            if (response.ok) {
                alert(existingData ? 'Category updated successfully!' : 'Category added successfully!');
                navigate('/Admin');
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to save category');
            }
        } catch (error) {
            alert('Error saving category: ' + error.message);
        }
    };

    return (
        <div className="add-category-container">
            <div className="form-header">
                <button className="back-button" onClick={() => navigate('/Admin')}>
                    ← Back to Dashboard
                </button>
                <h1>{existingData ? 'Edit' : 'Add'} {category?.title}</h1>
            </div>

            <form onSubmit={handleSubmit} className="add-category-form">
                <div className="form-group">
                    <label htmlFor="englishDescription">English Description</label>
                    <textarea
                        id="englishDescription"
                        name="englishDescription"
                        value={formData.englishDescription}
                        onChange={handleInputChange}
                        required
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sinhalaDescription">Sinhala Description</label>
                    <textarea
                        id="sinhalaDescription"
                        name="sinhalaDescription"
                        value={formData.sinhalaDescription}
                        onChange={handleInputChange}
                        required
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image">Upload Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!existingData}
                    />
                    {previewImage && (
                        <div className="image-preview">
                            <img src={previewImage} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="button-group">
                    <button
                        type="button"
                        onClick={() => {
                            // Reset form to initial state
                            setFormData({
                                englishDescription: existingData?.snakeenglishdescription || '',
                                sinhalaDescription: existingData?.snakesinhaladescription || '',
                                image: null
                            });
                            setPreviewImage(existingData?.snakeimage || null);
                        }}
                        className="cancel-button"
                    >
                        Reset Form
                    </button>
                    <button type="submit" className="submit-button">
                        {existingData ? 'Update' : 'Add'} Details
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditCategory;