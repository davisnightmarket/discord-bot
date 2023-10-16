{{#if (or hostList pickupList)}}
These night ops for {{dayName}}:
{{/if}}

{{#if (or myHostList myPickupList)}}
{{hostList}}
{{/if}}

{{#if myPickupList}}
{{pickupList}}
{{/if}}

{{#if (or myHostList myPickupList)}}
These are your commitments for {{dayName}}:
{{/if}}

{{#if (or myHostList myPickupList)}}
{{myHostList}}
{{/if}}

{{#if myPickupList}}
{{myPickupList}}
{{/if}}
