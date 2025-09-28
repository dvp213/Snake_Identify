import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const categories = [
    { id: 1, name: "Ceylonkrait", sinhala: "මුදු කරවලා" },
    { id: 2, name: "Commonkrait", sinhala: "තෙල් කරවලා" },
    { id: 3, name: "Cobra", sinhala: "නයා" },
    { id: 4, name: "Russellsviper", sinhala: "තිත් පොළඟා" },
    { id: 5, name: "Sawscaledviper", sinhala: "වැලි පොළඟා" },
];

function AddCategory() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '',
        englishDescription: '',
        sinhalaDescription: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);

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

        // Get the selected category from the dropdown
        const selectedCategoryId = formData.category;
        // Map category names to class_label numbers (0-4)
        const categoryToLabel = {
            'ceylonkrait': '0',
            'commonkrait': '2',
            'cobra': '1',
            'russellsviper': '3',
            'sawscaledviper': '4'
        };

        const class_label = categoryToLabel[selectedCategoryId] || '';
        const selectedCategory = categories.find(cat => cat.name.toLowerCase() === selectedCategoryId);

        // Create snake_data JSON
        const snakeData = {
            class_label: class_label,
            snakeenglishname: selectedCategory ? selectedCategory.name : '',
            snakesinhalaname: selectedCategory ? selectedCategory.sinhala : '',
            snakeenglishdescription: formData.englishDescription,
            snakesinhaladescription: formData.sinhalaDescription
        };

        const formDataToSend = new FormData();
        formDataToSend.append('snake_data', JSON.stringify(snakeData));

        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            const response = await fetch('http://localhost:8000/snake/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formDataToSend
            });

            if (response.ok) {
                alert('Category added successfully!');
                navigate('/Admin');
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to add category');
            }
        } catch (error) {
            alert('Error adding category: ' + error.message);
        }
    };

    return (
        <div className="add-category-container">
            <h1>Add Category</h1>
            <form onSubmit={handleSubmit} className="add-category-form">
                <div className="form-group">
                    <label htmlFor="category">Select Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name.toLowerCase()}>
                                {cat.name} ({cat.sinhala})
                            </option>
                        ))}
                    </select>
                </div>

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
                        required
                    />
                    {previewImage && (
                        <div className="image-preview">
                            <img src={previewImage} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="button-group">
                    <button type="button" onClick={() => navigate('/Admin')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button">
                        Add Category
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddCategory;