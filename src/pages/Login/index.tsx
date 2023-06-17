import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, Button, Grid, Container } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import useFetch, {FetchOptions} from '../../hooks/useFetch';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../redux/reducers/authSlice';

interface LoginFormValues {
  email: string;
  password: string;
}

const loginSchema = Yup.object().shape({
  email: Yup.string().required('Email is required').email('Invalid email'),
  password: Yup.string().min(6).required(),
});

const Login: React.FC = () => {
  const Navigate = useNavigate()
  const dispatch = useDispatch()
  
  const methods = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  });

  const {
    handleSubmit: loginHandleSubmit,
    register: loginRegister,
    formState: { errors: loginErrors, isDirty, isValid },
    setError
  } = methods

  const onFailure = useCallback((error: any)=>{
    setError('email',{message: error?.message},{shouldFocus: true})
  },[setError])

  const onSuccess = useCallback((response: any)=>{
    const sources = response.data
    localStorage.setItem('AUTH_TOKEN', sources.data.token)
    dispatch(updateProfile(sources.data))
    Navigate('/dashboard')
  },[Navigate, dispatch])

  const { isLoading, callFetch } = useFetch<any>({
    initialUrl: 'auth/login',
    skipOnStart: true,
    onFailure: onFailure,
    onSuccess: onSuccess,
  });


  const handleLoginSubmit = (data: LoginFormValues) => {
    // Perform login logic with data values
    callFetch({
      url: 'auth/login',
      method: 'POST',
      data:data
    })
    console.log(data);
  };


  return (
    <Container maxWidth="sm">
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <h2>Login</h2>
          <form onSubmit={loginHandleSubmit(handleLoginSubmit)}>
            <TextField
              type="email"
              label="Email"
              fullWidth
              {...loginRegister('email')}
              error={!!loginErrors.email}
              helperText={loginErrors.email?.message}
            />
            <TextField
              type="password"
              label="Password"
              fullWidth
              {...loginRegister('password')}
              error={!!loginErrors.password}
              helperText={loginErrors.password?.message}
            />
            <Button className='mr-2' type="submit" variant="contained" color="primary" disabled={!isDirty || !isValid}>
              Login
            </Button>
          </form>
            <span>Create a new Account?</span>
            <Button type="button" variant="contained" color="primary" onClick={()=>Navigate('/register')}>
              Register
            </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
