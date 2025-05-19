import React, { useEffect, useState } from 'react';

const Account = ({ token, uid }) => {
    // Initial form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        zipCode: ""
    });

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:8080/users/one/${uid}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.User) {
                    const { firstName, lastName, email, dateOfBirth, zipCode } = data.User;
                    setFormData({
                        firstName,
                        lastName,
                        email,
                        dateOfBirth: dateOfBirth?.split("T")[0], // Trim timestamp
                        zipCode
                    });
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        if (token && uid) {
            fetchUser();
        }
    }, [token, uid]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit updated user info
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/users/update/${uid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.Result) {
                alert("Account updated successfully!");
            } else {
                alert(data.Error || "Update failed.");
            }
        } catch (err) {
            console.error("Error updating account:", err);
            alert("Update failed due to network/server issue.");
        }
    };

    return (
        <div className='page flex flex-col'>
            <div className='py-4 text-center text-2xl font-bold'>Account Settings</div>

            <form onSubmit={handleUpdate} className='flex flex-col justify-center items-center gap-4'>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    placeholder="First Name"
                    onChange={handleChange}
                    className="input input-success"
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    placeholder="Last Name"
                    onChange={handleChange}
                    className="input input-success"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email"
                    onChange={handleChange}
                    className="input input-success"
                    required
                />
                <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input input-success"
                    required
                />
                <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    placeholder="ZIP Code"
                    onChange={handleChange}
                    className="input input-success"
                    required
                />

                <button type="submit" className="btn btn-success">Update Account</button>
            </form>
        </div>
    );
};

export default Account;