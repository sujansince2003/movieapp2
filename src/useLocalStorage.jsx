import { useState,useEffect} from "react";
export function useLocalStorage(initialState,key)
{
    const [Value, setValue] = useState(function () {
           const storedValue = localStorage.getItem(key);
           
         return storedValue ?  JSON.parse(storedValue) :initialState;
          
         
         });
         useEffect(
            function () {
              localStorage.setItem(key, JSON.stringify(Value));
            },
            [Value,key]
          );
          return [Value,setValue]
}