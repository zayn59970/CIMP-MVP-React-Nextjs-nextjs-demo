import mockApi from 'src/@mock-utils/mockApi';
import { Tag } from '@/app/(control-panel)/apps/contacts/ContactsApi';

/**
 * GET api/mock/contacts/tags
 */
export async function GET(req: Request) {
	const url = new URL(req.url);
	const queryParams = Object.fromEntries(url.searchParams.entries());
	const api = mockApi('contacts_tags');
	const items = await api.findAll<Tag>(queryParams);

	return new Response(JSON.stringify(items), { status: 200 });
}

/**
 * POST api/mock/contacts/tags
 */
export async function POST(req: Request) {
	const api = mockApi('contacts_tags');
	const requestData = (await req.json()) as Tag;
	const newItem = await api.create<Tag>(requestData);

	return new Response(JSON.stringify(newItem), { status: 201 });
}
