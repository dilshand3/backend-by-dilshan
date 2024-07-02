const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    // Get form data
    const formData = new FormData(event.target);
    
    // Construct data object from form data
    const postData = {
        username: formData.get('username'),
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        // Send POST request using Axios
        const response = await axios.post(' http://localhost:3000/user', postData);
        
        // Handle successful response
        console.log('Response from backend:', response.data);

        // Optionally, you can reset the form after successful submission
        event.target.reset();

        // Optionally, you can notify the user that registration was successful
        alert('User registered successfully!');
    } catch (error) {
        // Handle error
        console.error('Error registering user:', error);

        // Optionally, you can display an error message to the user
        alert('Failed to register user. Please try again.');
    }
};

// Add event listener to the form for 'submit' event
const form = document.getElementById('dataForm');
form.addEventListener('submit', handleSubmit);
