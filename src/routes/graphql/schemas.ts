import { Type } from '@fastify/type-provider-typebox';
import { GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

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
        id: {type: GraphQLString},
        discount: {type: GraphQLFloat},
        postsLimitPerMonth: {type: GraphQLInt},
    }),
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: GraphQLString},
        title: {type: GraphQLString},
        content: {type: GraphQLString},
        authorId: {type: GraphQLString}
    }),
})


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        balance: {type: GraphQLFloat}
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
        }
    }),

})

export const schema = new GraphQLSchema({
    query: RootQueryType
})
