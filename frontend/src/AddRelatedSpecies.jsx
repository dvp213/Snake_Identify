import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/EditCategory.css';
import { useAuth } from './contexts/AuthContext';

function AddRelatedSpecies() {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, isLoading, getAuthHeaders, token } = useAuth();
    const [formData, setFormData] = useState({
        snakeenglishname: '',
        snakesinhalaname: '',
        snakeenglishdescription: '',
        snakesinhaladescription: '',
        image: null,
        categoryClass: ''          // Class label (0-4) for this snake
    });
    const [previewImage, setPreviewImage] = useState(null);

    // Predefined categories
    const categories = [
        { id: '0', name: 'Ceylonkrait (මුදු කරවලා)' },
        { id: '1', name: 'Cobra (නයා)' },
        { id: '2', name: 'Commonkrait (තෙල් කරවලා)' },
        { id: '3', name: 'Russellsviper (තිත් පොළඟා)' },
        { id: '4', name: 'Sawscaledviper (වැලි පොළඟා)' }
    ];

    useEffect(() => {
        // Only redirect if we're done loading and user is not authenticated or not admin
        if (!isLoading && (!isAuthenticated || !isAdmin)) {
            navigate('/');
            return;
        }
    }, [isLoading, isAuthenticated, isAdmin, navigate]);

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

        if (!formData.categoryClass) {
            alert('Please select a category class for this snake.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Create snake data - for related species we're sending:
            // 1. The new related species details 
            // 2. The class_label to identify which main snake this is related to
            const snakeData = {
                // Information about the new related species (will be saved with NULL class_label)
                snakeenglishname: formData.snakeenglishname,
                snakesinhalaname: formData.snakesinhalaname,
                snakeenglishdescription: formData.snakeenglishdescription,
                snakesinhaladescription: formData.snakesinhaladescription,

                // The class_label is used to find the main snake to relate to
                class_label: formData.categoryClass,

                // Adding this flag to identify this as a related species request
                is_related_species: true
            };

            // Create form data
            const formDataToSend = new FormData();

            // Format the JSON string and log it for debugging
            const snakeDataJson = JSON.stringify(snakeData);
            console.log('Snake data JSON:', snakeDataJson);

            // Use 'snake_data' as the key - this must match what the backend expects
            formDataToSend.append('snake_data', snakeDataJson);

            if (!formData.image) {
                throw new Error('Please select an image');
            }

            // Verify image file details before appending
            console.log('Image file:', formData.image);
            console.log('Image file name:', formData.image.name);
            console.log('Image file type:', formData.image.type);
            console.log('Image file size:', formData.image.size);

            formDataToSend.append('image', formData.image);

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

            // Add the snake directly using our simplified endpoint
            // Debug the token
            // Debug token info for troubleshooting
            console.log('Using token:', token ? `${token.substring(0, 15)}...` : 'NO TOKEN FOUND');

            // Make sure we have a valid token
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }

            // Get auth headers from context
            const authHeaders = getAuthHeaders();
            console.log('Auth headers:', authHeaders);

            try {
                console.log('Sending request to:', `${apiBaseUrl}/snake/add`);
                console.log('FormData contents:');
                // Log FormData contents (for debugging)
                for (let pair of formDataToSend.entries()) {
                    console.log(pair[0], pair[1]);
                }

                const response = await fetch(
                    `${apiBaseUrl}/snake/add`,
                    {
                        method: 'POST',
                        headers: {
                            ...authHeaders,
                            // Don't set Content-Type for FormData, browser will set it automatically with boundary
                        },
                        body: formDataToSend,
                    }
                );

                // Immediately log response status
                console.log('Response status:', response.status);

                if (response.ok) {
                    const responseData = await response.json();
                    console.log('Success response:', responseData);

                    // Show success message to the user
                    alert(`Related species added successfully! Main snake ID: ${responseData.main_snake_id}, Related snake ID: ${responseData.related_snake_id}`);

                    // Redirect to the admin page
                    navigate('/Admin');
                } else {
                    // Handle error responses
                    const errorText = await response.text();
                    let errorMessage = 'Failed to add related species';

                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.detail || errorMessage;
                    } catch (e) {
                        // If not valid JSON, use the text as is
                        errorMessage = errorText || errorMessage;
                    }

                    console.error('Error response:', errorMessage);
                    alert(`Error: ${errorMessage}`);
                }
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                alert(`Network error: ${fetchError.message}`);
            }

            const responseText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Server response was not valid JSON: ' + responseText);
            }

            if (response.ok) {
                alert('Related species added successfully!');
                navigate('/Admin');
            } else {
                alert(responseData.detail || 'Failed to add related species');
            }
        } catch (error) {
            alert('Error adding related species: ' + error.message);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '20px',
                color: 'white',
                background: 'rgba(0, 0, 0, 0.8)'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div className="add-category-container">
            <div className="form-header">
                <button className="back-button" onClick={() => navigate('/Admin')}>
                    ← Back to Dashboard
                </button>
                <h1>Add Related Snake Species</h1>
            </div>

            <form onSubmit={handleSubmit} className="add-category-form">


                <div className="form-group">
                    <label htmlFor="categoryClass">Main Snake Category</label>
                    <select
                        id="categoryClass"
                        name="categoryClass"
                        value={formData.categoryClass}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">-- Select Main Snake Category --</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <p className="helper-text">Select the main snake category this species is related to.</p>
                </div>

                <div className="form-group">
                    <label htmlFor="snakeenglishname">English Name</label>
                    <input
                        type="text"
                        id="snakeenglishname"
                        name="snakeenglishname"
                        value={formData.snakeenglishname}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="snakesinhalaname">Sinhala Name</label>
                    <input
                        type="text"
                        id="snakesinhalaname"
                        name="snakesinhalaname"
                        value={formData.snakesinhalaname}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="snakeenglishdescription">English Description</label>
                    <textarea
                        id="snakeenglishdescription"
                        name="snakeenglishdescription"
                        value={formData.snakeenglishdescription}
                        onChange={handleInputChange}
                        required
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="snakesinhaladescription">Sinhala Description</label>
                    <textarea
                        id="snakesinhaladescription"
                        name="snakesinhaladescription"
                        value={formData.snakesinhaladescription}
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
                    <button
                        type="button"
                        onClick={() => {
                            // Reset form to initial state
                            setFormData({
                                snakeenglishname: '',
                                snakesinhalaname: '',
                                snakeenglishdescription: '',
                                snakesinhaladescription: '',
                                image: null,

                                categoryClass: ''
                            });
                            setPreviewImage(null);
                        }}
                        className="cancel-button"
                    >
                        Reset Form
                    </button>
                    <button type="submit" className="submit-button">
                        Add Related Species
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddRelatedSpecies;