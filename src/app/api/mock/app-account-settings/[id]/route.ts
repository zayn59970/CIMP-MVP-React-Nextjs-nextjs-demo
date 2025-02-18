import mockApi from 'src/@mock-utils/mockApi';
import { SettingsAccount } from '@/app/(control-panel)/apps/settings/SettingsApi';

/**
 * GET api/mock/app-account-settings/{id}
 */
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
	const { id } = await props.params;
	const api = mockApi('app_account_settings');
	const item = await api.find<SettingsAccount>(id);

	if (!item) {
		return new Response(JSON.stringify({ message: 'Item not found' }), { status: 404 });
	}

	return new Response(JSON.stringify(item), { status: 200 });
}

/**
 * PUT api/mock/app-account-settings/{id}
 */
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
	const { id } = await props.params;
	const api = mockApi('app_account_settings');
	const data = (await req.json()) as SettingsAccount;
	const updatedItem = await api.update<SettingsAccount>(id, data);

	if (!updatedItem) {
		return new Response(JSON.stringify({ message: 'Item not found' }), { status: 404 });
	}

	return new Response(JSON.stringify(updatedItem), { status: 200 });
}
