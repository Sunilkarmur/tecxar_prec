import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Input,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import useFetch from "../../hooks/useFetch";
import { Controller, useForm } from "react-hook-form";

const RoundedImage = styled("img")(({ theme }) => ({
  width: "50px",
  height: "50px",
  borderRadius: "100%",
  objectFit: "cover",
}));

interface TableRows extends GridRowsProp {
  id: number;
  name: string;
  action?: any;
}

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  image: any;
  category_id: any;
}

const productSchema = Yup.object().shape({
  name: Yup.string().required("Product Name is required"),
  description: Yup.string().required("Product description is required"),
  price: Yup.number().positive().required(),
  category_id: Yup.string().required("Product Price is required"),
  image: Yup.mixed()
  .test('fileType', 'Invalid file format', (value: any) => {
    if (value) {
      const supportedFormats = ['image/jpeg', 'image/png', 'image/gif'];
      return supportedFormats.includes(value.type);
    }
    return true;
  })
  .required('Please select an image file'),
});

const HomeComponent = () => {
  const [rows, setRows] = useState<TableRows[]>([]);
  const [addNewCategory, setAddNewCategory] = useState<boolean>(false);
  const [categoryList, seCategoryList] = useState<any[]>([]);
  const [editData, setEditData] = useState<TableRows | null>(null);

  const methods = useForm<ProductFormValues>({
    resolver: yupResolver(productSchema),
  });

  const {
    handleSubmit: onHandleSubmit,
    register: registerRegister,
    setValue,
    formState: { errors: registerErrors, isDirty, isValid },
    control,
    reset,
  } = methods;

  const onFailure = useCallback((error: any) => {
    setAddNewCategory(false);
    alert(error?.message);
  }, []);

  const onSuccess = useCallback((response: any) => {
    const sources = response.data;
    const data = sources?.data ?? [];
    setAddNewCategory(false);
    if (data?.length > 0) {
      setRows(sources?.data ?? []);
      return;
    }
    callFetch({
      url: "/products",
      method: "GET",
    });
  }, []);

  const { isLoading, callFetch } = useFetch<any>({
    initialUrl: "products",
    skipOnStart: true,
    onFailure: onFailure,
    onSuccess: onSuccess,
  });
  const onCategoryFailure = useCallback((error: any) => {
    alert(error?.message);
  }, []);

  const onCategorySuccess = useCallback((response: any) => {
    const sources = response.data;
    const data = sources?.data ?? [];
    seCategoryList(data);
  }, []);

  const { callFetch: getCatoryList } = useFetch<any>({
    initialUrl: "categories",
    skipOnStart: true,
    onFailure: onCategoryFailure,
    onSuccess: onCategorySuccess,
  });

  useEffect(() => {
    callFetch({
      url: "/products",
      method: "GET",
    });
    getCatoryList({
      url: "/categories",
      method: "GET",
    });
  }, [callFetch, getCatoryList]);

  const onSubmit = useCallback(
    (data: ProductFormValues) => {
      if (editData) {
        callFetch({
          url: `products/${editData?.id}`,
          method: "PUT",
          data: { ...data, categoryIdId: data.category_id },
        });
        return true;
      }
      let formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("categoryIdId", data.category_id);
      formData.append("image", data.image);
      callFetch({
        url: "products",
        method: "POST",
        data: formData,
        header: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
    },
    [callFetch, editData]
  );

  const onButtonClick = (row: any, type: string) => {
    if (type === "edit") {
      setEditData(row);
      setAddNewCategory(true);
      console.log(row);

      setValue("name", row?.name, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
      setValue("category_id", row?.category_id?.id ?? null, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
      setValue("description", row?.description, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
      setValue("price", row?.price, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
      return true;
    }
    callFetch({
      url: `/products/${row.id}`,
      method: "DELETE",
    });
    //do whatever you want with the row
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      renderCell: (params) => {
        return params.row.category_id?.name ?? "--";
      },
    },
    { field: "name", headerName: "Product Name", width: 200 },
    { field: "price", headerName: "Price", width: 120 },
    {
      field: "image",
      headerName: "Product Image",
      width: 150,
      renderCell: (params) => (
        <RoundedImage
          src={process.env.REACT_APP_API_URL + params.row.image}
          alt="Product"
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Button
              onClick={(e) => onButtonClick(params.row, "edit")}
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
            >
              Edit
            </Button>
            <Button
              onClick={(e) => onButtonClick(params.row, "delete")}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </>
        );
      },
    },
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
        <Button
          size="small"
          onClick={() => {
            setEditData(null);
            setAddNewCategory(true);
            reset();
          }}
        >
          Add New Product
        </Button>
      </Stack>
      <div style={{ minHeight: 300, minWidth: "70%" }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
      <Dialog open={addNewCategory} onClose={() => setAddNewCategory(false)}>
        <DialogTitle>
          {editData ? "Update Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent style={{ minWidth: 500 }}>
          <form onSubmit={onHandleSubmit(onSubmit)}>
            <Grid style={{ marginBottom: "15px" }}>
              <Controller
                name="category_id"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="dropdown-label"
                    id="dropdown"
                    label="Select an Cateogry"
                    style={{ width: 200 }}
                  >
                    {categoryList.map((value, index) => (
                      <MenuItem value={value.id}>{value.name}</MenuItem>
                    ))}
                  </Select>
                )}
              />
            </Grid>
            <Grid style={{ marginBottom: "15px" }}>
              <TextField
                type="text"
                label="Product Name"
                fullWidth
                {...registerRegister("name")}
                error={!!registerErrors.name}
                helperText={registerErrors.name?.message}
              />
            </Grid>
            <Grid style={{ marginBottom: "15px" }}>
              <TextField
                type="text"
                label="Product Description"
                fullWidth
                {...registerRegister("description")}
                error={!!registerErrors.description}
                helperText={registerErrors.description?.message}
              />
            </Grid>
            <Grid style={{ marginBottom: "15px" }}>
              <TextField
                type="number"
                label="price"
                fullWidth
                {...registerRegister("price")}
                error={!!registerErrors.price}
                helperText={registerErrors.price?.message}
              />
            </Grid>

            {!editData && (
              <Grid style={{ marginBottom: "15px" }}>
                <Controller
                  control={control}
                  name="image"
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        fullWidth
                        type="file"
                        onChange={(event: any) =>
                          field.onChange(event.target.files[0])
                        }
                        inputProps={{
                          accept: "image/*",
                        }}
                      />
                      <Typography
                        variant="body1"
                        color={Boolean(error) ? "error" : "initial"}
                      >
                        {Boolean(error) ? error?.message : ""}
                      </Typography>
                    </>
                  )}
                />
              </Grid>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNewCategory(false)}>Cancel</Button>
          <Button onClick={onHandleSubmit(onSubmit)}>
            {" "}
            {editData ? "Update Product" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default HomeComponent;
