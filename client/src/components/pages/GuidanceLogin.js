import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isEmailValid } from '../../utils/validator';

const GuidanceLogin = () => {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ email: '', password: '' });
    const { email, password } = inputs;

    const handleInputChange = e => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        e.target.className += ' was-validated';

        if (email && password) {
            if (isEmailValid(email)) {
                try {
                    const response = await fetch('/auth/guidance-login/', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        toast.success('Login successful!');
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
        <section className='d-flex justify-content-center align-items-center vh-100 bg-light'>
            <div className='container' style={{ maxWidth: '400px' }}>
                <form className='needs-validation' noValidate onSubmit={handleSubmit}>
                    <h1 className='custom-heading mb-5 text-center'>Guidance Login</h1>
                    <div className='form-group mb-4'>
                        <label htmlFor='email' className='form-label'>Email</label>
                        <input
                            className={`form-control ${!email ? 'is-invalid' : ''}`}
                            value={email}
                            type='email'
                            id='email'
                            name='email'
                            required
                            placeholder='Enter your email'
                            onChange={handleInputChange}
                        />
                        <div className='invalid-feedback'>Email can't be empty</div>
                    </div>
                    <div className='form-group mb-4'>
                        <label htmlFor='password' className='form-label'>Password</label>
                        <input
                            className={`form-control ${!password ? 'is-invalid' : ''}`}
                            value={password}
                            type='password'
                            id='password'
                            name='password'
                            required
                            placeholder='Enter your password'
                            onChange={handleInputChange}
                        />
                        <div className='invalid-feedback'>Password can't be empty</div>
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
