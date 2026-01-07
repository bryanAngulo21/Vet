
import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './pages/Home'
import Login from './pages/Login'
import { Register } from './pages/Register'
import { Forgot } from './pages/Forgot'
import { Confirm } from './pages/Confirm'
import { NotFound } from './pages/NotFound'
import Dashboard from './layout/Dashboard'
import Profile from './pages/Profile'
import List from './pages/List'
import Details from './pages/Details'
import Create from './pages/Create'
import Update from './pages/Update'
import Chat from './pages/Chat'
import Reset from './pages/Reset'
import Panel from './pages/Panel'

import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'

import { useEffect } from 'react'
import storeProfile from './context/storeProfile'
import storeAuth from './context/storeAuth'

import PrivateRouteWithRole from './routes/PrivateRouteWithRole'

//


function App() {
  //llamo en el componente App el store Profile Y el StoreAuth
  //necisto que cda vez que alguien inice sesion se cargue lainformacion  del usuario
  //uso useedct para que se carguen
  const { profile} = storeProfile()//del storeProfile obtengo el metodo profile
  const { token } = storeAuth()//del storesAuth tomo la variabel token 

  // Use effecto efctos secuandarios 
  //si exite un token se ejcuta la funcion profile y cada vez que exita un cambio en el token la informacon se va actualizar 
//cada vez que se navegue en tre paginas
  useEffect(() => {
    if(token){
      profile()
    }
  }, [token])

  return (
    <>
    <BrowserRouter>
      <Routes>
        
        
         <Route element={<PublicRoute />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path='forgot/:id' element={<Forgot />} />
            <Route path='confirm/:token' element={<Confirm />} />
            <Route path='reset/:token' element={<Reset />} />
            <Route path='*' element={<NotFound />} />
          </Route>


          <Route path='dashboard/*' element={
            <ProtectedRoute>
              <Routes>
                <Route element={<Dashboard />}>
                  <Route index element={
                    <PrivateRouteWithRole>
                      <Panel />
                    </PrivateRouteWithRole>
                  } />
                  <Route path='profile' element={<Profile />} />
                  <Route path='list' element={<List />} />
                  <Route path='details/:id' element={<Details />} />
                  <Route path='create' element={
                    <PrivateRouteWithRole>
                      <Create />
                    </PrivateRouteWithRole>
                  } />
                  <Route path='update/:id' element={
                    <PrivateRouteWithRole>
                      <Update />
                    </PrivateRouteWithRole>
                  } />
                  <Route path='chat' element={<Chat />} />
                </Route>
              </Routes>
            </ProtectedRoute>
            } />

      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
