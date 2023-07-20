import { Type } from '@fastify/type-provider-typebox';
import {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} from 'graphql';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const MemberType = new GraphQLObjectType({
    name: 'Member',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        discount: {type: new GraphQLNonNull(GraphQLFloat)},
        postsLimitPerMonth: {type: new GraphQLNonNull(GraphQLInt)},
    }),
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        title: {type: GraphQLString},
        content: {type: GraphQLString},
        authorId: {type: new GraphQLNonNull(GraphQLString)}
    }),
})


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        balance: {type: new GraphQLNonNull(GraphQLFloat)}
    }),
})

const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        isMale: {type: new GraphQLNonNull(GraphQLBoolean)},
        yearOfBirth: {type: new GraphQLNonNull(GraphQLInt)},
    }),
})

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: () =>({
        memberTypes: {
            type: new GraphQLList(MemberType),
            async resolve(obj, args, prisma, info) {
                return prisma.memberType.findMany();
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            async resolve(obj, args, prisma, info) {
                return prisma.post.findMany();
            }
        },
        users: {
            type: new GraphQLList(UserType),
            async resolve(obj, args, prisma, info) {
                return prisma.user.findMany();
            }
        },
        profiles: {
            type: new GraphQLList(ProfileType),
            async resolve(obj, args, prisma, info) {
                return prisma.profile.findMany();
            }
        }
    }),

})

export const schema = new GraphQLSchema({
    query: RootQueryType
})
