const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./src/models/Author')
const Book = require('./src/models/Book')
const User = require('./src/models/User')

const jwt = require('jsonwebtoken')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]
let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

mongoose.set('useFindAndModify', false)

//const MONGODB_URI = 'mongodb+srv://fullstack:sekred@cluster0-ostce.mongodb.net/graphql?retryWrites=true'
const MONGODB_URI = 'mongodb+srv://jorma:1jorma8183@cluster0-kmsw3.mongodb.net/lib-app?retryWrites=true&w=2`'
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
    books: [Book!]
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }
  

  type Token {
    value: String!
    user: User!
  }

  type Query {
    currentUser: User
    allUsers: [User!]!
    meee: User!
    authorCount: Int!
    allAuthors: [Author!]!
    findAuthor(name: String!): Author

    bookCount: Int!
    allBooks(genre: String): [Book!]!
    findUser(token: String): User!
  }

  type Mutation {

    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ):Book 

    editAuthor(
      name: String!
      setBornTo: Int!
    ):Author

    addAuthor(
      name: String,
      born: Int
    ):Author

    createUser(
      username: String!
    ): User
    
    login(
      username: String!
      password: String!
    ): Token
  }
`
const uuid = require('uuid/v1')
const resolvers = {
  Query: {
    meee: (root, args,  { currentUser} ) => {
      console.log('in me, context.currentUser', currentUser)
            return currentUser
    },
    currentUser: (root, args, { currentUser }) => {
      return currentUser
    },
    allUsers: async () => await User.find({}) , 
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: async (root, args) => await Author.find({}),
    
    findAuthor: (root, args) => {
      return Author.findOne({ name: args.name } )
    },
    bookCount: () => Book.collection.countDocuments(),

    allBooks: async (root, args) =>{
      console.log('allBooks, args', args)
      if(args.genre) {
console.log('if args.genre', args.genre)        
        const books =  await Book.find({genres: {$in: [args.genre]}}).populate('author')
        //console.log('books', books)
        return books
      }
      return await Book.find({}).populate('author')
    }

  },
  
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
console.log('addBook, args', args)
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const author = await Author.findOne({name: args.author})
      let newAuthor
      if(author === null) {
        newAuthor = new Author({name: args.author})
        try {
          await newAuthor.save()
        }catch(error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      args.author = author?author.id:newAuthor.id
      const book = new Book({ ...args})

      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return await Book.findById(book.id).populate('author') 
    },

    editAuthor: async (root, args, { currentUser }) => {
console.log('editAUthor,args', args)      
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const author = await Author.findOne({ name: args.name})
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
      },
      
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET), user: user }
    },
   
  },
  Author: {
    books: async (root) => await Book.find({ author:  root.id }), 
    bookCount: async (root) => {
      const books = await Book.find({author: root.id } )
      //const coll = await Book.collection.countDocuments({author: root.id})
      return books.length
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
//      currentUser:  currentUser
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})