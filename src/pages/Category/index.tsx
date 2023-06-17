import { Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Stack, TextField } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { DataGrid, GridRowsProp, GridColDef, useGridApiRef } from "@mui/x-data-grid";
  
import useFetch from "../../hooks/useFetch";

interface TableRows extends GridRowsProp {
  id: number;
  name: string;
  action?: any;
}



const CategoryComponent = () => {
  const [rows, setRows] = useState<TableRows[]>([]);
  const [addNewCategory, setAddNewCategory] = useState<boolean>(false);
  const [category, setCategory] = useState<string | null>(null);
  const [editData, setEditData] = useState<TableRows | null>(null);

  const onFailure = useCallback((error: any) => {
    setAddNewCategory(false)
    alert(error?.message);
  }, []);

  const onSuccess = useCallback((response: any) => {
    const sources = response.data;
    const data = sources?.data ?? []
    setAddNewCategory(false)
    if (data?.length > 0) {
        setRows(sources?.data ?? []);
        return;
    }
    callFetch({
        url: "/categories",
        method: "GET",
      });
  }, []);

  const { isLoading, callFetch } = useFetch<any>({
    initialUrl: "categories",
    skipOnStart: true,
    onFailure: onFailure,
    onSuccess: onSuccess,
  });

  useEffect(() => {
    callFetch({
      url: "/categories",
      method: "GET",
    });
  }, [callFetch]);

  const onAddNewCategory = useCallback(()=>{
    if (!category) {
        alert('Please Enter Category Name')
        return false
    }
    callFetch({
        url: editData?`/categories/${editData?.id}`:"/categories/",
        method: editData?'PUT':"POST",
        data: {name: category}
      });
  },[callFetch, category])

  const onButtonClick = (row: any, type: string) => {
    if (type==="edit") {
        setEditData(row)
        setAddNewCategory(true)
        setCategory(row?.name )
        console.log(row, type);
        return true
    }
    callFetch({
        url: `/categories/${row.id}`,
        method: "DELETE",
      });
    //do whatever you want with the row
};


  const columns: GridColDef[] = [
    { field: "id", headerName: "Category ID", width: 150 },
    { field: "name", headerName: "Category Name", width: 150 },
    { field: "action", headerName: "Action", width: 150, renderCell: (params) => {
        return (
          <>
          <Button
            onClick={(e) => onButtonClick(params.row,'edit')}
            variant="contained"
            color="primary"
            style={{marginRight: '10px'}}
          >
            Edit
          </Button>
          <Button
            onClick={(e) => onButtonClick(params.row,'delete')}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
          </>
        );
      } },
  ];

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
    //   justifyContent="center"
    >
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={()=>{
            setCategory(null)
            setEditData(null)
            setAddNewCategory(true)
        }}>
        Add New Category
        </Button>
      </Stack>
      <div style={{ minHeight: 300, minWidth: '70%' }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
      <Dialog open={addNewCategory} onClose={()=>setAddNewCategory(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent style={{minWidth: 500}}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Category Name"
            type="text"
            fullWidth
            value={category ?? (editData?.name ?? null)}
            variant="standard"
            onChange={(event: any)=>setCategory(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setAddNewCategory(false)}>Cancel</Button>
          <Button onClick={onAddNewCategory}>Save</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CategoryComponent;
