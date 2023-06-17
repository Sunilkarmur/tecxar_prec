import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAsyncDebounce } from 'react-table';
import request, { METHODS } from '../utils/axios';

export type FetchOptions = {
    initialUrl: string | null;
    initialData?: any;
    config?: any;
    skipOnStart: boolean;
    onSuccess?:(data: any) => void;
    onFailure?:(data: any) => void;
    transform?: any;
};

export const asyncWrapper = (promise: any) =>
  promise
    .then((data: any) => ({ data, error: null }))
    .catch((error: any) => ({ data: null, error }));

const useFetch = <T>({
    initialUrl = null,
  initialData = null,
  config = {},
  skipOnStart = false,
  onSuccess,
  onFailure,
  transform,
}: FetchOptions) => {
    const [url, updateUrl] = useState(initialUrl);
    const [data, setData] = useState(initialData);
    // in case of fetch on mount - set isLoading to true
    const [isLoading, setIsLoading] = useState(!skipOnStart);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [fetchIndex, setFetchIndex] = useState(skipOnStart ? 0 : 1);
  
    const transformResponse = useCallback(
      (response: any) => {
        try {
          const parsedResponse = JSON.parse(response);
          return transform?.(parsedResponse) ?? parsedResponse;
        } catch (error) {
          throw new Error('Error parsing response JSON data');
        }
      },
      [transform]
    );
  
    const [axiosConfig, updateConfig] = useState({
      ...config,
      ...(transform && { transformResponse }),
    });
  
    const updateView = useCallback((newConfig: any) => {
      setHasError(false);
      setIsLoading(true);
  
      if (newConfig) {
        updateConfig((prevConfig: any) => ({
          ...prevConfig,
          ...newConfig,
        }));
      }
  
      setFetchIndex(prevFetchIndex => prevFetchIndex + 1);
    }, []);
  
    const callFetch = useAsyncDebounce(updateView, 200);
  
    useEffect(() => {
      const cancelTokenSource = axios.CancelToken.source();
  
      const fetchData = async () => {
        const URL = url;
        const { data: response, error } = await asyncWrapper(
            request({
            url: URL,
            cancelToken: cancelTokenSource.token,
            method: METHODS.GET,
            ...axiosConfig,
          })
        );
        if (!error) {
          setData(response);
          setHasError(false);
          setErrorMessage(null);
          setIsLoading(false);
          setFetchIndex(0);
          onSuccess?.(response);
        } else {
          const errorMsg = error?.message || "Something Went Wrong";
          // in case cancel token error - do not update react state to prevent memory leak
          setHasError(true);
          setIsLoading(false);
          setFetchIndex(0);
        //   setErrorMessage('errr');
            onFailure?.(errorMsg)
        }
        return { response, error };
      };
  
      if (fetchIndex > 0 && url) {
        fetchData();
      }
  
      return () => {
        cancelTokenSource.cancel("component unmount");
      };
    }, [url, axiosConfig, fetchIndex, onSuccess, onFailure]);
  
    return {
      data,
      isLoading,
      hasError,
      errorMessage,
      callFetch,
      updateUrl,
      updateConfig,
    };
};

export default useFetch;
