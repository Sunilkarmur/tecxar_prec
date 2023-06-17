import React, { useCallback } from "react";
import { useForm, Control, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { TextField, Button, Grid, Container, Input } from "@material-ui/core";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";

interface RegisterFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile: number;
  profile_image: any;
}

const imageFileExtensions = ["jpg", "jpeg", "png", "gif"];

const registerSchema = Yup.object().shape({
  first_name: Yup.string().required("first_name is required"),
  last_name: Yup.string().required("last_name is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  password: Yup.string().required("Password is required"),
  mobile: Yup.number().required(),
  profile_image: Yup.mixed().test(
    "fileType",
    "Invalid image format",
    (value: any) => {
      if (!value) return true; // Allow empty value
      console.log(value);

      const { mimetype } = value;
      if (mimetype) {
        const fileExtension = mimetype.split("/").pop()?.toLowerCase();
        return imageFileExtensions.includes(fileExtension);
      }

      const fileExtension = value.name.split(".").pop()?.toLowerCase();
      return imageFileExtensions.includes(fileExtension);
    }
  ),
});

const Registration: React.FC = () => {
  const Navigate = useNavigate()
  const methods = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
  });

  const {
    handleSubmit: registerHandleSubmit,
    register: registerRegister,
    formState: { errors: registerErrors, isDirty, isValid },
    control,
    setError
  } = methods;

  const onFailure = useCallback((error: any)=>{
    // alert(error?.message);
    setError('email',{message: error?.message},{shouldFocus: true})
  },[setError])

  const onSuccess = useCallback((response: any)=>{
    const sources = response.data
    Navigate('/')
  },[Navigate])

  const { isLoading, callFetch } = useFetch<any>({
    initialUrl: 'auth/register',
    skipOnStart: true,
    onFailure: onFailure,
    onSuccess: onSuccess,
  });

  const handleRegisterSubmit = (data: RegisterFormValues) => {
    // Perform registration logic with data values
    let formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('mobile', data.mobile.toString());
    formData.append('profile_image', data.profile_image);
    console.log(data);
    callFetch({
      url: 'auth/register',
      method: 'POST',
      data:formData,
      header: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    })
  };

  return (
    <Container maxWidth="sm">
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <h2>Register</h2>
          <form onSubmit={registerHandleSubmit(handleRegisterSubmit)}>
            <Grid className="mb-5">
              <TextField
                type="text"
                label="First Name"
                fullWidth
                {...registerRegister("first_name")}
                error={!!registerErrors.first_name}
                helperText={registerErrors.first_name?.message}
              />
            </Grid>
            <Grid className="mb-5">
              <TextField
                type="text"
                label="Last Name"
                fullWidth
                {...registerRegister("last_name")}
                error={!!registerErrors.last_name}
                helperText={registerErrors.last_name?.message}
              />
            </Grid>
            <Grid className="mb-5">
              <TextField
                type="email"
                label="Email"
                fullWidth
                {...registerRegister("email")}
                error={!!registerErrors.email}
                helperText={registerErrors.email?.message}
              />
            </Grid>
            <Grid className="mb-5">
              <TextField
                type="password"
                label="Password"
                fullWidth
                {...registerRegister("password")}
                error={!!registerErrors.password}
                helperText={registerErrors.password?.message}
              />
            </Grid>
            <Grid className="mb-5">
              <TextField
                type="mobile"
                label="Mobile"
                fullWidth
                {...registerRegister("mobile")}
                error={!!registerErrors.mobile}
                helperText={registerErrors.mobile?.message}
              />
            </Grid>
            <Controller
              control={control}
              name="profile_image"
              render={({
                field,
                fieldState: { invalid, isTouched, isDirty, error },
              }) => (
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
              )}
            />

            <Grid className="mb-5">
              <Button type="submit" variant="contained" color="primary" disabled={!isDirty || !isValid}>
                Register
              </Button>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Registration;
