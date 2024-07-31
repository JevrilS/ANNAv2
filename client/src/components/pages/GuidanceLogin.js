import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isEmailValid } from '../../utils/validator';

const GuidanceLogin = () => {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ email: '', password: '', school: '' });
    const { email, password, school } = inputs;

    const handleInputChange = e => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        e.target.className += ' was-validated';
        
        if (email && password && school) {
            if (isEmailValid(email)) {
                try {
                    const response = await fetch('/auth/guidance-login/', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'X-School-ID': school // Replace with actual school ID
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        }),
                    });

                    const data = await response.json();
                    
                    if (response.ok) {
                        navigate('/dashboard');
                    } else {
                        toast.error(data.message || 'Login failed');
                    }
                } catch (error) {
                    console.error('Login Error:', error);
                    toast.error('An error occurred during login');
                }
            } else {
                toast.error('Invalid email format');
            }
        } else {
            toast.error('Please fill in all fields');
        }
    };

    return (
        <section className='d-flex justify-content-center align-items-center vh-100'>
            <div className='container' style={{ maxWidth: '400px' }}>
                <form className='needs-validation' noValidate onSubmit={handleSubmit}>
                    <h1 className='custom-heading mb-5 text-center'>Sign In</h1>
                    <div className='mb-4'>
                        <input
                            className='form-control py-2'
                            value={email}
                            type='email'
                            id='email'
                            name='email'
                            required
                            placeholder='Email'
                            onChange={handleInputChange}
                        />
                        {!email && <div className='invalid-feedback py-1 px-1'>Email can't be empty</div>}
                    </div>
                    <div className='mb-4'>
                        <input
                            className='form-control py-2'
                            value={password}
                            type='password'
                            id='password'
                            name='password'
                            required
                            placeholder='Password'
                            onChange={handleInputChange}
                        />
                        {!password && <div className='invalid-feedback py-1 px-1'>Password can't be empty</div>}
                    </div>
                    <div className='mb-4'>
                        <input
                            className='form-control py-2'
                            value={school}
                            type='text'
                            id='school'
                            name='school'
                            required
                            placeholder='School ID'
                            onChange={handleInputChange}
                        />
                        {!school && <div className='invalid-feedback py-1 px-1'>School ID can't be empty</div>}
                    </div>
                    <button className='btn btn-primary w-100' type='submit'>
                        Sign in
                    </button>
                </form>
            </div>
        </section>
    );
};

export default GuidanceLogin;
