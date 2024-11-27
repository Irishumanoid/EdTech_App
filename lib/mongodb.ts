import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri: string = process.env.NEXT_PUBLIC_MONGODB_URI || '';
const client = new MongoClient(uri);

export const fetchRegistration = async (email: string, username: string, password: string) => {
    try {
        client.connect();
        const users = client.db('users').collection('registration_data');
        let error = [];
        if (await users.findOne({email: email})) {
        error.push('email');
        }
        if (await users.findOne({username: username})) {
        error.push('username');
        }
        
        if (error.length !== 0) {
        return {
            statusCode: 403,
            body: `User already exists for ${error.join(', ')}`
        };
        }
        //if no errors, register user
        const hashedPassword = await bcrypt.hash(password, 12);
        await users.insertOne({email: email, username: username, password: hashedPassword});
        return {
            statusCode: 201,
            body: 'Inserted new user'
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

export const verifyLogin = async (email: string, password: string) => {
    try {
        client.connect();
        const users = client.db('users').collection('registration_data');
        const user = await users.findOne({email: email});
        if (!user) {
            console.log('User not found'); 
            await client.close();
            return {
              statusCode: 401,
              body: 'Invalid email or password.', 
            };
          }
      
          bcrypt.compare(password, user.password, (err, result) => {
              if (err) {
                  return {
                      statusCode: 400,
                      body: 'Error comparing passwords',
                  };
              } 
      
              if (result) {
                  console.log('Inputted password matches');
              } else {
                  return {
                      statusCode: 401, 
                      body: 'Invalid email or password.', 
                  };
              }
          });

          return {
            statusCode: 200, 
            body: JSON.stringify({ userId: user._id }),
          };  
    } catch (err) {
        console.error('Error:', err);
    }
}

export const addStory = async (text: string, uuid?: string) => {
    try {
        client.connect();
        const stories = client.db('users').collection('stories');
        const out = await stories.insertOne({uuid, text});
        
        return {
            statusCode: 201,
            body: `Inserted new story, ${out}`
        };
    } catch (err) {
        console.error('Error:', err);
    }
}

export const fetchStory = async (uuid: string) => {
    try {
        client.connect();
        const stories = client.db('users').collection('stories');
        const story = await stories.findOne({uuid});

        return {
            statusCode: 200,
            body: JSON.stringify({message: 'Fetched story', content: story?.text})
        };
    } catch (err) {
        console.error('Error:', err);
    }
}
