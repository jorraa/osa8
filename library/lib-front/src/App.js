import React, { useState, useEffect } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { CURRENT_USER } from './queries.js'

const App = () => {
  const [page, setPage] = useState('authors')
  const [booksType, setBooksType] = useState('normal')
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)
  const client = useApolloClient()

  const result = useQuery(CURRENT_USER)
  useEffect(() => {
    if ( result.data ) {
      setUser(result.data.currentUser)
    }
  }, [result.data]) // eslint-disable-line

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const logout = () => {
    setUser(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => {
            setPage('books')
            setBooksType('normal')
          }
        }>books</button>
        {user
          ?<span>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => {
              setPage('books')
              setBooksType('recommend')}
            }>recommend</button>
            <button onClick={() => logout()}>logout</button>
          </span>
          :<button onClick={() => setPage('login')}>login</button>
        }
      </div>
      <Notify errorMessage={errorMessage} />
      <Authors
        show={page === 'authors'}  setError={ notify  }
      />

      <Books
        show={page === 'books'} type={booksType} setError={ notify } user={user}
      />
      {user
      ?<NewBook
        show={page === 'add'} setError={ notify }
      />
      :<LoginForm 
        show={page === 'login'}
        setUser={setUser}
        setError={notify}/>
      }
    </div>
  )

}

const Notify = ({errorMessage}) => {
  if ( !errorMessage ) {
    return null
  }
  return (
    <div style={{color: 'red'}}>
      {errorMessage}
    </div>
  )
}

export default App;
