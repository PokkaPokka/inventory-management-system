"use client";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

// Style object for the modal
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "#DFD0B8",
  border: "2px solid #b5b5b5",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export default function Home() {
  // State to hold pantry items
  const [pantry, setPantry] = useState([]);
  // State to control modal visibility
  const [open, setOpen] = useState(false);
  // State to control modal visibility for removing multiple items
  const [removeOpen, setRemoveOpen] = useState(false);
  // State to hold new item name
  const [itemName, setItemName] = useState("");
  // State to hold new item count
  const [itemCount, setAddItemCount] = useState(1);
  // State to hold new item count
  const [itemRemoveCount, setRemoveItemCount] = useState(1);
  // State to hold new search query
  const [searchQuery, setSearchQuery] = useState("");
  // State to hold sort criteria
  const [sortCriteria, setSortCriteria] = useState("nameAsc");

  // Function to open modal
  const handleOpen = () => setOpen(true);
  // Function to close modal
  const handleClose = () => setOpen(false);

  // Function to fetch pantry items from Firestore
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, count: doc.data().count });
    });

    // Function to sort pantry items
    pantryList.sort((a, b) => {
      if (sortCriteria === "nameAsc") {
        return a.name.localeCompare(b.name);
      } else if (sortCriteria === "nameDesc") {
        return b.name.localeCompare(a.name);
      } else if (sortCriteria === "countDesc") {
        return b.count - a.count;
      } else if (sortCriteria === "countAsc") {
        return a.count - b.count;
      }
    });

    console.log(pantryList);
    setPantry(pantryList);
  };

  // Fetch pantry items on component mount
  useEffect(() => {
    updatePantry();
  }, [sortCriteria]);

  // Function to add a new item to Firestore
  const addItem = async (item, count = 1) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // If the item exists, increment the count
      const currentCount = Number(docSnap.data().count);
      await setDoc(
        docRef,
        { count: currentCount + Number(count) },
        { merge: true }
      );
    } else {
      // If the item does not exist, set the count to the specified value
      await setDoc(docRef, { count: Number(count) });
    }

    await updatePantry();
  };

  // Function to remove an item from Firestore
  const removeItem = async (item, count = 1) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentCount = Number(docSnap.data().count);
      await setDoc(
        docRef,
        { count: currentCount - Number(count) },
        { merge: true }
      );

      if (currentCount - Number(count) <= 0) {
        await deleteDoc(docRef);
      }
    }

    await updatePantry();
  };

  // Fuction to search for an item in the pantry
  const filteredPantry = pantry.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle sort criteria change
  const handleSortChange = (event) => {
    setSortCriteria(event.target.value);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {/* Modal for adding new items */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="Quantity"
              variant="outlined"
              value={itemCount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setAddItemCount(value);
                }
              }}
            />
            <Button
              variant="outlined"
              sx={{
                backgroundColor: "#3C5B6F", // Custom background color
                color: "#ffffff", // Custom text color
                "&:hover": {
                  backgroundColor: "#3C5B5A", // Custom hover color
                },
              }}
              onClick={() => {
                addItem(itemName, itemCount);
                setItemName("");
                setAddItemCount(1);
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box
        width={"1200px"}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={3}
      >
        <Box display={"flex"} flexDirection={"row"} gap={1}>
          <TextField
            id="search-bar"
            label="Search Items"
            variant="outlined"
            sx={{ width: "300px", height: "50px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControl sx={{ width: "200px", height: "50px" }}>
            <InputLabel id="select-label">Sort</InputLabel>
            <Select
              labelId="select-label"
              id="select"
              value={sortCriteria}
              label="Sort"
              onChange={handleSortChange}
            >
              <MenuItem value={"nameAsc"}>Name Ascending</MenuItem>
              <MenuItem value={"nameDesc"}>Name Descending</MenuItem>
              <MenuItem value={"countAsc"}>Quantity Ascending</MenuItem>
              <MenuItem value={"countDesc"}>Quantity Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#3C5B6F", // Custom background color
            color: "#ffffff", // Custom text color
            "&:hover": {
              backgroundColor: "#3C5B5A", // Custom hover color
            },
          }}
          onClick={handleOpen}
        >
          Add Items
        </Button>
      </Box>
      <Box border="1px solid black" boxShadow={24}>
        <Box
          width="1200px"
          height="100px"
          bgcolor="#153448"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h3" color="#ffffff" textAlign="center">
            Pantry Inventory
          </Typography>
        </Box>
        <Stack width="1200px" height="600px" overflow="scroll">
          {filteredPantry.map(({ name, count }) => (
            <Box
              key={name}
              width="100%"
              minHeight="110px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              paddingY={2}
              paddingX={4}
              bgcolor="#DFD0B8"
              border={"1px solid #b5b5b5"}
            >
              <Box
                width="60%"
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
                gap={2}
              >
                <Typography
                  variant="h3"
                  color="#ffffff"
                  textAlign="center"
                  noWrap
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "60%",
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h5" color="#ffffff" textAlign="center">
                  (Quantity: {count})
                </Typography>
              </Box>
              <Box
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                gap={5}
              >
                <Button
                  variant="contained"
                  sx={{
                    width: "90px",
                    backgroundColor: "#3C5B6F", // Custom background color
                    color: "#ffffff", // Custom text color
                    "&:hover": {
                      backgroundColor: "#3C5B5A", // Custom hover color
                    },
                  }}
                  onClick={() => removeItem(name)}
                >
                  Remove Item
                </Button>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  gap={1}
                >
                  <TextField
                    id="remove-bar"
                    label="Remove Multiple"
                    variant="outlined"
                    sx={{ width: "130px" }}
                    value={itemRemoveCount}
                    onChange={(e) => {
                      const itemRemoveCount = e.target.value;
                      if (/^\d*$/.test(itemRemoveCount)) {
                        setRemoveItemCount(itemRemoveCount);
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      width: "100px",
                      backgroundColor: "#3C5B6F", // Custom background color
                      color: "#ffffff", // Custom text color
                      "&:hover": {
                        backgroundColor: "#3C5B5A", // Custom hover color
                      },
                    }}
                    onClick={() => {
                      removeItem(name, itemRemoveCount);
                      setRemoveItemCount(1);
                    }}
                  >
                    Remove Multiple
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
