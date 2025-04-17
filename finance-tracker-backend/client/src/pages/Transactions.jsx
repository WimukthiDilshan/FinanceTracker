import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

function Transactions() {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2024-03-23',
      description: 'Grocery Shopping',
      amount: -150.00,
      category: 'Food',
      type: 'expense',
    },
    {
      id: 2,
      date: '2024-03-22',
      description: 'Salary',
      amount: 3000.00,
      category: 'Income',
      type: 'income',
    },
  ]);

  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    category: '',
    type: 'expense',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      date: '',
      description: '',
      amount: '',
      category: '',
      type: 'expense',
    });
  };

  const handleSubmit = () => {
    const newTransaction = {
      id: transactions.length + 1,
      ...formData,
      amount: parseFloat(formData.amount),
    };
    setTransactions([...transactions, newTransaction]);
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
    'Income',
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add Transaction
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.category}
                    color={transaction.type === 'income' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: transaction.type === 'income' ? 'success.main' : 'error.main',
                  }}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              label="Amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{ startAdornment: '$' }}
            />
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
              select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </TextField>
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

export default Transactions; 