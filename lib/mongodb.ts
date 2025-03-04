import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri: string = process.env.MONGODB_URI || '';
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

export const updateUser = async (userId: string, username?: string, bio?: string) => {
    try {
        client.connect();
        const users = client.db('users').collection('registration_data');

        let result;
        if (username) {
            const count = await users.countDocuments({ username });
            if (count !== 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'User with the same username already exists' })
                };
            }
            result = await users.updateOne({_id: new ObjectId(userId)}, {$set: {username}});
        } else if (bio) {
            result = await users.updateOne({_id: new ObjectId(userId)}, {$set: {bio}});
        }

        if (result?.acknowledged) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: `Successfully modified ${username ? username : bio}` })
            };
        }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Error modifying user' })
    };
    } catch (err) {
        console.error('Error:', err);
    }
}

export const fetchUserData = async (userId: string, field: string) => {
    try {
        client.connect();
        const stories = client.db('users').collection('registration_data');
        const user = await stories.findOne({_id: new ObjectId(userId)});

        if (user) {
            const curField = field === 'username' ? user.username : user.bio;
            if (curField) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({message: 'Fetched user data', data: curField})
                };
            }
        }
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Failed for fetch user data for ${field}` })
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

export const fetchStory = async (uuid: string, nameOnly: boolean) => {
    try {
        client.connect();
        const stories = client.db('users').collection('stories');
        const story = await stories.findOne({uuid});
        if (nameOnly) {
            const name = story?.name;
            return {
                statusCode: 200,
                body: JSON.stringify( {message: 'Fetched story name', content: name ? name : ''} )
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify( {message: 'Fetched story', content: story?.text} )
            };
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

export const setStoryName = async (uuid: string, name: string) => {
    try {
        client.connect();
        const stories = client.db('users').collection('stories');
        const story = await stories.updateOne({uuid}, {$set: {name}});
        if (story.modifiedCount === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify( {message: 'Set story name for ', uuid} )
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify( {message: 'Failed to set story name'} )
            };
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

export const deleteStoryText = async (uuid: string) => {
    try {
        client.connect();
        const stories = client.db('users').collection('stories');
        const story = await stories.deleteOne({uuid});
        if (story.deletedCount === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify( {message: `Deleted story ${uuid}`} )
            };
        }
        return {
            statusCode: 400,
            body: JSON.stringify( {message: `Failed to deleted story ${uuid}`} )
        };
    } catch (err) {
        console.error('Error:', err);
    }
}

