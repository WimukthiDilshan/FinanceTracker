import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera,
  Notifications,
  Security,
  Language,
  DarkMode,
} from '@mui/icons-material';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
    currency: 'USD',
    emailNotifications: true,
    budgetAlerts: true,
    transactionAlerts: true,
  });

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
  });

  const handleSettingChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = () => {
    // Handle profile save
    console.log('Saving profile:', profile);
  };

  const handleSaveSettings = () => {
    // Handle settings save
    console.log('Saving settings:', settings);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 100, height: 100, mr: 2 }}
                src="/path-to-avatar.jpg"
              />
              <Box>
                <Typography variant="h6">Profile Picture</Typography>
                <Button
                  startIcon={<PhotoCamera />}
                  variant="outlined"
                  size="small"
                >
                  Change Photo
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleSaveProfile}
            >
              Save Profile Changes
            </Button>
          </Paper>
        </Grid>

        {/* Preferences Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                select
                fullWidth
                label="Language"
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                sx={{ mb: 2 }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </TextField>

              <TextField
                select
                fullWidth
                label="Currency"
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                sx={{ mb: 2 }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </TextField>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={() => handleSettingChange('darkMode')}
                  />
                }
                label="Dark Mode"
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleSaveSettings}
            >
              Save Preferences
            </Button>
          </Paper>
        </Grid>

        {/* Notifications Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={() => handleSettingChange('notifications')}
                  />
                }
                label="Enable Notifications"
              />
            </Box>

            <Box sx={{ ml: 4, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange('emailNotifications')}
                  />
                }
                label="Email Notifications"
              />
            </Box>

            <Box sx={{ ml: 4, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.budgetAlerts}
                    onChange={() => handleSettingChange('budgetAlerts')}
                  />
                }
                label="Budget Alerts"
              />
            </Box>

            <Box sx={{ ml: 4, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.transactionAlerts}
                    onChange={() => handleSettingChange('transactionAlerts')}
                  />
                }
                label="Transaction Alerts"
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleSaveSettings}
            >
              Save Notification Settings
            </Button>
          </Paper>
        </Grid>

        {/* Security Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security
            </Typography>

            <Button
              variant="outlined"
              startIcon={<Security />}
              sx={{ mr: 2 }}
            >
              Change Password
            </Button>
            <Button
              variant="outlined"
              startIcon={<Security />}
              color="error"
            >
              Enable Two-Factor Authentication
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Settings; 