import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

function Budget() {
  const [open, setOpen] = useState(false);
  const [budgets, setBudgets] = useState([
    {
      id: 1,
      category: 'Food',
      allocated: 500,
      spent: 350,
      remaining: 150,
    },
    {
      id: 2,
      category: 'Transportation',
      allocated: 300,
      spent: 200,
      remaining: 100,
    },
    {
      id: 3,
      category: 'Entertainment',
      allocated: 200,
      spent: 150,
      remaining: 50,
    },
  ]);

  const [formData, setFormData] = useState({
    category: '',
    allocated: '',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      category: '',
      allocated: '',
    });
  };

  const handleSubmit = () => {
    const newBudget = {
      id: budgets.length + 1,
      ...formData,
      allocated: parseFloat(formData.allocated),
      spent: 0,
      remaining: parseFloat(formData.allocated),
    };
    setBudgets([...budgets, newBudget]);
    handleClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const categories = [
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
  ];

  const BudgetCard = ({ budget }) => {
    const progress = (budget.spent / budget.allocated) * 100;
    const color = progress > 90 ? 'error' : progress > 70 ? 'warning' : 'success';

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{budget.category}</Typography>
            <Box>
              <IconButton size="small" color="primary">
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Spent: ${budget.spent}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Remaining: ${budget.remaining}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            Total Budget: ${budget.allocated}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Budget</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add Budget Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {budgets.map((budget) => (
          <Grid item xs={12} sm={6} md={4} key={budget.id}>
            <BudgetCard budget={budget} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Budget Category</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Allocated Amount"
              type="number"
              name="allocated"
              value={formData.allocated}
              onChange={handleChange}
              InputProps={{ startAdornment: '$' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Budget; 