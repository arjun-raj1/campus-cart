const { supabase } = require('../config/db');

// Simple mockup for login (since full auth requires Supabase Auth or JWT setup)
// This will just verify if the user exists in our DB and return their role.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // In a real app, password should be hashed. For this prototype, we'll just check if the email exists.
    // Let's query the users table we created in our trust schema.
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Auto-register mock users if they don't exist just for the prototype's sake
      // If email has "admin", make them an admin. Otherwise student.
      const role = email.includes('admin') ? 'admin' : 'student';
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ 
          name: email.split('@')[0], 
          email: email, 
          role: role,
          is_verified: true
        }])
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ success: false, message: "Error creating user" });
      }
      user = newUser;
    }

    // "Login" successful, return user info
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      },
      token: "mock-jwt-token-123" // In production, generate a real JWT
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};
